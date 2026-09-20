import { createServer, type Server as HttpServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { randomBytes } from 'node:crypto';
import { WebSocket, WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

/**
 * A local, same-machine/LAN real-time collaboration server for Advanced
 * Markdown Workspace (Phase 8 Stage 6), hand-rolling the same wire protocol
 * `y-websocket`'s reference server uses (`y-protocols/sync` +
 * `y-protocols/awareness` message framing over a plain `ws` WebSocket)
 * rather than depending on `y-websocket` itself — its package only exports
 * the browser `WebsocketProvider` client, not its server utility, under a
 * resolvable subpath.
 *
 * Security carve-out from every other Phase 8 backend: LAN reachability is
 * the whole point of this stage, so this binds `0.0.0.0` (a real interface),
 * not `127.0.0.1` — a deliberate, narrow exception to the "loopback only"
 * rule (see `electron/AGENTS.md`). A random per-session code, required as a
 * `?code=` query param before a connection is accepted, is the mitigation:
 * only someone who was given the code out-of-band (the session's own
 * sharing UI) can join, not anyone who happens to be on the same LAN.
 */

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

export interface CollabSession {
  readonly port: number;
  readonly sessionCode: string;
  readonly lanAddress: string;
  readonly participantCount: () => number;
  stop(): void;
}

function pickLanAddress(): string {
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal) return address.address;
    }
  }
  return '127.0.0.1';
}

function send(conn: WebSocket, encoder: encoding.Encoder): void {
  if (conn.readyState !== WebSocket.OPEN && conn.readyState !== WebSocket.CONNECTING) return;
  try {
    conn.send(encoding.toUint8Array(encoder));
  } catch {
    conn.close();
  }
}

export function startCollabServer(): Promise<CollabSession> {
  const doc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(doc);
  const sessionCode = randomBytes(6).toString('hex');
  const connControlledIds = new Map<WebSocket, Set<number>>();

  const httpServer: HttpServer = createServer();
  const wss = new WebSocketServer({ server: httpServer });

  function broadcast(encoder: encoding.Encoder): void {
    const message = encoding.toUint8Array(encoder);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    }
  }

  doc.on('update', (update: Uint8Array) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    broadcast(encoder);
  });

  awareness.on('update', ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, origin: WebSocket | null) => {
    const changedIds = added.concat(updated, removed);
    const controlled = origin ? connControlledIds.get(origin) : undefined;
    if (controlled) {
      for (const id of added.concat(updated)) controlled.add(id);
      for (const id of removed) controlled.delete(id);
    }

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedIds));
    broadcast(encoder);
  });

  wss.on('connection', (conn, req) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.searchParams.get('code') !== sessionCode) {
      conn.close(4001, 'Invalid session code');
      return;
    }

    connControlledIds.set(conn, new Set());

    const syncEncoder = encoding.createEncoder();
    encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(syncEncoder, doc);
    send(conn, syncEncoder);

    const states = awareness.getStates();
    if (states.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(awarenessEncoder, awarenessProtocol.encodeAwarenessUpdate(awareness, [...states.keys()]));
      send(conn, awarenessEncoder);
    }

    conn.on('message', (data: ArrayBuffer) => {
      const decoder = decoding.createDecoder(new Uint8Array(data));
      const messageType = decoding.readVarUint(decoder);

      if (messageType === MESSAGE_SYNC) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
        if (encoding.length(encoder) > 1) send(conn, encoder);
      } else if (messageType === MESSAGE_AWARENESS) {
        awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), conn);
      }
    });

    conn.on('close', () => {
      const controlled = connControlledIds.get(conn);
      connControlledIds.delete(conn);
      if (controlled && controlled.size > 0) {
        awarenessProtocol.removeAwarenessStates(awareness, [...controlled], null);
      }
    });
  });

  return new Promise((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(0, '0.0.0.0', () => {
      const address = httpServer.address();
      if (address === null || typeof address === 'string') {
        reject(new Error('Collab server did not bind to a TCP port'));
        return;
      }
      resolve({
        port: address.port,
        sessionCode,
        lanAddress: pickLanAddress(),
        participantCount: () => wss.clients.size,
        stop: () => {
          awareness.destroy();
          doc.destroy();
          wss.close();
          httpServer.close();
        },
      });
    });
  });
}

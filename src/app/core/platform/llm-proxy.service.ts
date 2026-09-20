import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';

export interface LlmChatMessage {
  readonly role: 'system' | 'user';
  readonly content: string;
}

/**
 * Renderer-side client for Stage 4's local LLM proxy. `getEndpoint()`
 * lazily starts the loopback proxy in the main process (see
 * `electron/llm-bridge.ts`) the first time it's called; `chat()` then talks
 * to that loopback endpoint via ordinary `fetch`, same as any other
 * loopback HTTP call — IPC's only job is handing back the port.
 */
@Injectable({ providedIn: 'root' })
export class LlmProxyService {
  private readonly platform = inject(PlatformService);

  async isConfigured(): Promise<boolean> {
    if (!this.platform.isDesktop()) return false;
    return window.dude!.llm.isConfigured();
  }

  async chat(messages: readonly LlmChatMessage[]): Promise<string> {
    if (!this.platform.isDesktop()) {
      throw new Error('AI features are only available in the desktop app.');
    }

    const endpoint = await window.dude!.llm.getEndpoint();
    if (!endpoint.ok) {
      throw new Error(endpoint.error === 'not-configured' ? 'Configure an LLM provider in Settings to use AI features.' : endpoint.error);
    }

    let response: Response;
    try {
      response = await fetch(`http://127.0.0.1:${endpoint.port}/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
    } catch {
      throw new Error('Could not reach the local LLM proxy.');
    }

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : 'The AI request failed.';
      throw new Error(message);
    }

    const content = (data as { choices?: readonly { message?: { content?: unknown } }[] } | null)?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('The AI response was in an unexpected format.');
    }
    return content;
  }
}

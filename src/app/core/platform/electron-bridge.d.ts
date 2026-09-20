export interface NativeStat {
  readonly isFile: boolean;
  readonly isDirectory: boolean;
  readonly isSymbolicLink: boolean;
  readonly size: number;
  readonly mtimeMs: number;
}

export type NativeFsResult<T> = ({ readonly ok: true } & T) | { readonly ok: false; readonly error: { readonly code: string; readonly message: string } };

export interface DudeElectronBridge {
  readonly platform: {
    readonly isDesktop: true;
  };
  readonly fs: {
    pickDirectory(): Promise<{ readonly canceled: true } | { readonly canceled: false; readonly rootPath: string; readonly rootName: string }>;
    walk(rootPath: string): Promise<NativeFsResult<{ entries: readonly { readonly path: string; readonly size: number }[] }>>;
    readFile(rootPath: string, relativePath: string): Promise<NativeFsResult<{ data: ArrayBuffer }>>;
    readdir(rootPath: string, relativePath: string): Promise<NativeFsResult<{ names: readonly string[] }>>;
    stat(rootPath: string, relativePath: string, followSymlink: boolean): Promise<NativeFsResult<{ stat: NativeStat }>>;
  };
}

declare global {
  interface Window {
    readonly dude?: DudeElectronBridge;
  }
}

export {};

export interface ArchiveEntry {
  readonly name: string;
  readonly data: Uint8Array;
}

export type ArchiveFormat = 'zip' | 'tar' | 'tar.gz';

export const ARCHIVE_FORMATS: Record<ArchiveFormat, string> = {
  zip: 'ZIP',
  tar: 'TAR',
  'tar.gz': 'TAR.GZ',
};

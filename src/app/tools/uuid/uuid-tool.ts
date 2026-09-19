export function generateUuidV4(): string {
  return crypto.randomUUID();
}

export interface UuidInspection {
  readonly valid: boolean;
  readonly version?: number;
  readonly variant?: string;
}

const UUID_PATTERN =
  /^([0-9a-f]{8})-([0-9a-f]{4})-([1-8])[0-9a-f]{3}-([89ab][0-9a-f]{3})-([0-9a-f]{12})$/i;

export function inspectUuid(value: string): UuidInspection {
  const match = UUID_PATTERN.exec(value.trim());
  if (!match) return { valid: false };

  const version = parseInt(match[3], 16);
  return { valid: true, version, variant: 'RFC 4122' };
}

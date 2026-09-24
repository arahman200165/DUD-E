import { dataViewOf, readUint16, readUint32, readUint64 } from '../../shared/utils/struct-reader';

const DOS_MAGIC = 0x5a4d; // 'MZ'
const PE_SIGNATURE = 0x00004550; // 'PE\0\0'
const OPTIONAL_HEADER_PE32 = 0x10b;
const OPTIONAL_HEADER_PE32_PLUS = 0x20b;

const MACHINE_NAMES: Record<number, string> = {
  0x014c: 'i386',
  0x0200: 'IA64',
  0x8664: 'x64 (AMD64)',
  0x01c0: 'ARM',
  0xaa64: 'ARM64',
};

const SUBSYSTEM_NAMES: Record<number, string> = {
  1: 'Native',
  2: 'Windows GUI',
  3: 'Windows CUI',
  5: 'OS/2 CUI',
  7: 'POSIX CUI',
  9: 'Windows CE GUI',
  10: 'EFI Application',
  11: 'EFI Boot Service Driver',
  12: 'EFI Runtime Driver',
  13: 'EFI ROM',
  14: 'Xbox',
  16: 'Windows Boot Application',
};

const DATA_DIRECTORY_NAMES = [
  'Export Table',
  'Import Table',
  'Resource Table',
  'Exception Table',
  'Certificate Table',
  'Base Relocation Table',
  'Debug',
  'Architecture',
  'Global Ptr',
  'TLS Table',
  'Load Config Table',
  'Bound Import',
  'IAT',
  'Delay Import Descriptor',
  'CLR Runtime Header',
  'Reserved',
];

export interface PeDataDirectory {
  readonly name: string;
  readonly virtualAddress: number;
  readonly size: number;
}

export interface PeSection {
  readonly name: string;
  readonly virtualSize: number;
  readonly virtualAddress: number;
  readonly sizeOfRawData: number;
  readonly pointerToRawData: number;
  readonly characteristics: number;
}

export interface PeReport {
  readonly isPe: true;
  readonly machine: string;
  readonly numberOfSections: number;
  readonly timestamp: string;
  readonly characteristics: number;
  readonly optionalHeaderMagic: 'PE32' | 'PE32+' | 'unknown';
  readonly addressOfEntryPoint: number;
  readonly imageBase: string;
  readonly subsystem: string;
  readonly sizeOfImage: number;
  readonly sizeOfHeaders: number;
  readonly dataDirectories: readonly PeDataDirectory[];
  readonly sections: readonly PeSection[];
  readonly importedDlls: readonly string[];
  readonly exportDllName: string | null;
  readonly exportFunctionCount: number;
  readonly exportNameCount: number;
}

export interface PeParseError {
  readonly isPe: false;
  readonly error: string;
}

function readCString(bytes: Uint8Array, offset: number, maxLength = 256): string {
  let end = offset;
  while (end < bytes.length && end < offset + maxLength && bytes[end] !== 0) end++;
  let out = '';
  for (let i = offset; i < end; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

function rvaToFileOffset(sections: readonly PeSection[], rva: number): number | null {
  for (const section of sections) {
    const size = Math.max(section.virtualSize, section.sizeOfRawData);
    if (rva >= section.virtualAddress && rva < section.virtualAddress + size) {
      return section.pointerToRawData + (rva - section.virtualAddress);
    }
  }
  return null;
}

export function parsePeHeaders(bytes: Uint8Array): PeReport | PeParseError {
  if (bytes.length < 64) return { isPe: false, error: 'File is too small to contain a DOS header.' };

  const view = dataViewOf(bytes);
  if (readUint16(view, 0, 'LE') !== DOS_MAGIC) return { isPe: false, error: 'Missing "MZ" DOS header signature.' };

  const peOffset = readUint32(view, 0x3c, 'LE');
  if (peOffset + 24 > bytes.length) return { isPe: false, error: 'PE header offset (e_lfanew) is out of range.' };
  if (readUint32(view, peOffset, 'LE') !== PE_SIGNATURE) return { isPe: false, error: 'Missing "PE\\0\\0" signature at e_lfanew.' };

  const coffOffset = peOffset + 4;
  const machineCode = readUint16(view, coffOffset, 'LE');
  const numberOfSections = readUint16(view, coffOffset + 2, 'LE');
  const timeDateStamp = readUint32(view, coffOffset + 4, 'LE');
  const sizeOfOptionalHeader = readUint16(view, coffOffset + 16, 'LE');
  const characteristics = readUint16(view, coffOffset + 18, 'LE');

  const optOffset = coffOffset + 20;
  const magicValue = sizeOfOptionalHeader >= 2 ? readUint16(view, optOffset, 'LE') : 0;
  const isPe32Plus = magicValue === OPTIONAL_HEADER_PE32_PLUS;
  const optionalHeaderMagic: PeReport['optionalHeaderMagic'] = magicValue === OPTIONAL_HEADER_PE32 ? 'PE32' : isPe32Plus ? 'PE32+' : 'unknown';

  let addressOfEntryPoint = 0;
  let imageBase = 0n;
  let sizeOfImage = 0;
  let sizeOfHeaders = 0;
  let subsystemCode = 0;
  let numberOfRvaAndSizes = 0;
  let dataDirStart = 0;

  if (sizeOfOptionalHeader >= 96) {
    addressOfEntryPoint = readUint32(view, optOffset + 16, 'LE');
    if (isPe32Plus) {
      imageBase = readUint64(view, optOffset + 24, 'LE');
      sizeOfImage = readUint32(view, optOffset + 56, 'LE');
      sizeOfHeaders = readUint32(view, optOffset + 60, 'LE');
      subsystemCode = readUint16(view, optOffset + 68, 'LE');
      numberOfRvaAndSizes = readUint32(view, optOffset + 108, 'LE');
      dataDirStart = optOffset + 112;
    } else {
      imageBase = BigInt(readUint32(view, optOffset + 28, 'LE'));
      sizeOfImage = readUint32(view, optOffset + 56, 'LE');
      sizeOfHeaders = readUint32(view, optOffset + 60, 'LE');
      subsystemCode = readUint16(view, optOffset + 68, 'LE');
      numberOfRvaAndSizes = readUint32(view, optOffset + 92, 'LE');
      dataDirStart = optOffset + 96;
    }
  }

  const dataDirectories: PeDataDirectory[] = [];
  const directoryCount = Math.min(numberOfRvaAndSizes, DATA_DIRECTORY_NAMES.length);
  for (let i = 0; i < directoryCount; i++) {
    const entryOffset = dataDirStart + i * 8;
    if (entryOffset + 8 > bytes.length) break;
    dataDirectories.push({
      name: DATA_DIRECTORY_NAMES[i],
      virtualAddress: readUint32(view, entryOffset, 'LE'),
      size: readUint32(view, entryOffset + 4, 'LE'),
    });
  }

  const sectionsStart = optOffset + sizeOfOptionalHeader;
  const sections: PeSection[] = [];
  for (let i = 0; i < numberOfSections; i++) {
    const entryOffset = sectionsStart + i * 40;
    if (entryOffset + 40 > bytes.length) break;

    let name = '';
    for (let j = 0; j < 8 && bytes[entryOffset + j] !== 0; j++) name += String.fromCharCode(bytes[entryOffset + j]);

    sections.push({
      name,
      virtualSize: readUint32(view, entryOffset + 8, 'LE'),
      virtualAddress: readUint32(view, entryOffset + 12, 'LE'),
      sizeOfRawData: readUint32(view, entryOffset + 16, 'LE'),
      pointerToRawData: readUint32(view, entryOffset + 20, 'LE'),
      characteristics: readUint32(view, entryOffset + 36, 'LE'),
    });
  }

  const importedDlls: string[] = [];
  try {
    const importDirectory = dataDirectories.find((d) => d.name === 'Import Table');
    if (importDirectory && importDirectory.virtualAddress > 0) {
      let descriptorOffset = rvaToFileOffset(sections, importDirectory.virtualAddress);
      while (descriptorOffset !== null && descriptorOffset + 20 <= bytes.length) {
        const nameRva = readUint32(view, descriptorOffset + 12, 'LE');
        const firstThunk = readUint32(view, descriptorOffset, 'LE');
        if (nameRva === 0 && firstThunk === 0) break;

        const nameOffset = rvaToFileOffset(sections, nameRva);
        if (nameOffset !== null) importedDlls.push(readCString(bytes, nameOffset));
        descriptorOffset += 20;
      }
    }
  } catch {
    // Leaves importedDlls as whatever was resolved before the failure -- headers/sections are the primary payload.
  }

  let exportDllName: string | null = null;
  let exportFunctionCount = 0;
  let exportNameCount = 0;
  try {
    const exportDirectory = dataDirectories.find((d) => d.name === 'Export Table');
    if (exportDirectory && exportDirectory.virtualAddress > 0) {
      const exportOffset = rvaToFileOffset(sections, exportDirectory.virtualAddress);
      if (exportOffset !== null && exportOffset + 40 <= bytes.length) {
        const nameOffset = rvaToFileOffset(sections, readUint32(view, exportOffset + 12, 'LE'));
        exportDllName = nameOffset !== null ? readCString(bytes, nameOffset) : null;
        exportFunctionCount = readUint32(view, exportOffset + 20, 'LE');
        exportNameCount = readUint32(view, exportOffset + 24, 'LE');
      }
    }
  } catch {
    // Export table is optional/best-effort, same rationale as the import table above.
  }

  return {
    isPe: true,
    machine: MACHINE_NAMES[machineCode] ?? `unknown (0x${machineCode.toString(16)})`,
    numberOfSections,
    timestamp: timeDateStamp > 0 ? new Date(timeDateStamp * 1000).toISOString() : 'not set',
    characteristics,
    optionalHeaderMagic,
    addressOfEntryPoint,
    imageBase: '0x' + imageBase.toString(16),
    subsystem: SUBSYSTEM_NAMES[subsystemCode] ?? `unknown (${subsystemCode})`,
    sizeOfImage,
    sizeOfHeaders,
    dataDirectories,
    sections,
    importedDlls,
    exportDllName,
    exportFunctionCount,
    exportNameCount,
  };
}

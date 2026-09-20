/**
 * Pure, framework-free folder scanning for the Directory Diff tool.
 *
 * Uses `<input webkitdirectory>` rather than the File System Access API's
 * `showDirectoryPicker()` — broad support (Chromium/Firefox/Safari) over
 * Chromium-only, for a one-shot snapshot comparison that doesn't need a
 * live, re-scannable directory handle.
 */

export interface ScannedFile {
  readonly path: string;
  readonly file: File;
}

export function scanFileList(fileList: FileList): readonly ScannedFile[] {
  const files: ScannedFile[] = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    files.push({ path: file.webkitRelativePath || file.name, file });
  }
  return files;
}

import { scanFileList } from './directory-tree-scan';

function fakeFileList(files: readonly File[]): FileList {
  const list = files.slice() as unknown as FileList & File[];
  return list;
}

function fakeFile(name: string, relativePath: string): File {
  const file = new File(['content'], name) as File & { webkitRelativePath: string };
  Object.defineProperty(file, 'webkitRelativePath', { value: relativePath, configurable: true });
  return file;
}

describe('scanFileList', () => {
  it('uses webkitRelativePath when present', () => {
    const file = fakeFile('a.txt', 'my-folder/sub/a.txt');
    const result = scanFileList(fakeFileList([file]));
    expect(result).toEqual([{ path: 'my-folder/sub/a.txt', file }]);
  });

  it('falls back to the plain file name when webkitRelativePath is empty', () => {
    const file = new File(['content'], 'plain.txt');
    const result = scanFileList(fakeFileList([file]));
    expect(result).toEqual([{ path: 'plain.txt', file }]);
  });

  it('scans multiple files', () => {
    const a = fakeFile('a.txt', 'dir/a.txt');
    const b = fakeFile('b.txt', 'dir/b.txt');
    const result = scanFileList(fakeFileList([a, b]));
    expect(result.map((r) => r.path)).toEqual(['dir/a.txt', 'dir/b.txt']);
  });

  it('returns an empty array for an empty FileList', () => {
    expect(scanFileList(fakeFileList([]))).toEqual([]);
  });
});

import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { exceedsMaxSize, matchesAccept } from './file-drop-validation';

/**
 * Generic drag-and-drop / click-to-browse file input. No tool in the repo
 * handled `File` input before Phase 5 — this is shared by File Hashing,
 * File Base64 Conversion, and Advanced Diff/Merge's file-upload mode.
 *
 * Holds no persisted state: `File` objects aren't JSON-serializable, and
 * file content should never silently persist anyway.
 */
@Component({
  selector: 'app-file-drop',
  templateUrl: './file-drop.html',
})
export class FileDrop {
  readonly accept = input<string | undefined>(undefined);
  readonly multiple = input(false);
  readonly disabled = input(false);
  readonly label = input('Drop a file here, or click to browse');
  readonly maxSizeBytes = input<number | undefined>(undefined);

  readonly fileSelected = output<File>();
  readonly filesSelected = output<readonly File[]>();
  readonly rejected = output<string>();

  protected readonly isDragOver = signal(false);
  protected readonly selectedFile = signal<File | null>(null);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) this.isDragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (this.disabled()) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.handleFiles(files);
  }

  protected onZoneClick(): void {
    if (!this.disabled()) this.fileInput().nativeElement.click();
  }

  protected onZoneKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.onZoneClick();
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.handleFiles(input.files);
    input.value = '';
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private handleFiles(fileList: FileList): void {
    const files = this.multiple() ? Array.from(fileList) : [fileList[0]];
    const accept = this.accept();
    const maxSizeBytes = this.maxSizeBytes();

    for (const file of files) {
      if (!matchesAccept(file, accept)) {
        this.rejected.emit(`"${file.name}" doesn't match the accepted file type${accept ? ` (${accept})` : ''}.`);
        return;
      }
      if (exceedsMaxSize(file, maxSizeBytes)) {
        this.rejected.emit(`"${file.name}" exceeds the maximum size of ${this.formatSize(maxSizeBytes!)}.`);
        return;
      }
    }

    this.selectedFile.set(files[0]);
    this.filesSelected.emit(files);
    this.fileSelected.emit(files[0]);
  }
}

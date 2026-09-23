import { Component, computed, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { FileDrop } from '../../shared/components/file-drop/file-drop';
import { sniffImageType } from '../../shared/utils/image-signature';
import { parsePngIhdr, PngIhdr } from './png-header';

interface ImageMetadata {
  readonly fileName: string;
  readonly fileSize: number;
  readonly declaredMime: string;
  readonly detectedMime: string | null;
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: string;
  readonly pngIhdr: PngIhdr | null;
}

function simplifyRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  if (width === 0 || height === 0) return `${width}:${height}`;
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

@Component({
  selector: 'app-image-metadata-inspector',
  imports: [ToolShell, ErrorPanel, FileDrop],
  templateUrl: './image-metadata-inspector.html',
})
export class ImageMetadataInspector {
  protected readonly rejection = signal<string | null>(null);
  protected readonly metadata = signal<ImageMetadata | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected readonly formattedSize = computed(() => {
    const bytes = this.metadata()?.fileSize;
    if (bytes === undefined) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  });

  protected async onFileSelected(file: File): Promise<void> {
    this.rejection.set(null);
    this.metadata.set(null);
    this.loading.set(true);

    const previousUrl = this.previewUrl();
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const detected = sniffImageType(bytes);

      let width = 0;
      let height = 0;
      try {
        const bitmap = await createImageBitmap(file);
        width = bitmap.width;
        height = bitmap.height;
        bitmap.close();
      } catch {
        // Falls through with width/height at 0 -- reported as "unavailable" in the template.
      }

      this.metadata.set({
        fileName: file.name,
        fileSize: file.size,
        declaredMime: file.type || 'unknown',
        detectedMime: detected?.mime ?? null,
        width,
        height,
        aspectRatio: width && height ? simplifyRatio(width, height) : 'unavailable',
        pngIhdr: detected?.mime === 'image/png' ? parsePngIhdr(bytes) : null,
      });
      this.previewUrl.set(URL.createObjectURL(file));
    } catch {
      this.rejection.set("Couldn't read this file.");
    } finally {
      this.loading.set(false);
    }
  }

  protected onRejected(message: string): void {
    this.rejection.set(message);
  }

  protected clear(): void {
    const previousUrl = this.previewUrl();
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    this.metadata.set(null);
    this.previewUrl.set(null);
    this.rejection.set(null);
  }
}

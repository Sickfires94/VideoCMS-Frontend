import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss']
})
export class FileSelectorComponent implements OnChanges {
  @Output() fileSelected = new EventEmitter<File | null>();
  @Input() selectedFile: File | null = null;
  @Input() fileUploadProgress: number | null = null;
  @Input() isUploading: boolean = false;

  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  fileName: string = 'No file chosen';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedFile'] && changes['selectedFile'].currentValue !== changes['selectedFile'].previousValue) {
      this.fileName = this.selectedFile ? this.selectedFile.name : 'No file chosen';
      if (!this.selectedFile && this.fileInputRef && this.fileInputRef.nativeElement) {
          this.fileInputRef.nativeElement.value = '';
      }
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const originalFile = input.files[0];

      // --- NEW LOGIC: Comprehensive Filename Sanitization ---
      let baseName = originalFile.name;
      let extension = '';

      // Separate filename from extension
      const lastDotIndex = baseName.lastIndexOf('.');
      if (lastDotIndex > 0) { // Ensure it's not a hidden file like .htaccess
        extension = baseName.substring(lastDotIndex); // Includes the dot, e.g., ".mp4"
        baseName = baseName.substring(0, lastDotIndex);
      }

      // 1. Replace all non-alphanumeric, non-underscore, non-hyphen, non-period characters with an underscore.
      // This handles spaces, em-dashes, and other symbols.
      // Regex: [^a-zA-Z0-9_.-]
      // g: global (replace all occurrences)
      // i: case-insensitive (not strictly needed with ^a-zA-Z0-9, but harmless)
      let sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_.-]/g, '_');

      // 2. Replace multiple consecutive underscores/hyphens with a single underscore/hyphen.
      // And replace combinations like '-_' or '_-'
      sanitizedBaseName = sanitizedBaseName.replace(/[_]{2,}/g, '_'); // Replace __ with _
      sanitizedBaseName = sanitizedBaseName.replace(/[-]{2,}/g, '-'); // Replace -- with -
      sanitizedBaseName = sanitizedBaseName.replace(/[-_]+|-+/g, '_'); // Replace any combo of -_ with single _

      // 3. Trim leading/trailing underscores or hyphens
      sanitizedBaseName = sanitizedBaseName.replace(/^[_.-]+|[_.-]+$/g, '');

      // Ensure base name is not empty after sanitization
      if (sanitizedBaseName === '') {
        sanitizedBaseName = 'untitled_file'; // Fallback name
      }

      const sanitizedFileName = sanitizedBaseName + extension;
      // --- END NEW LOGIC ---

      // Create a new File object with the sanitized name
      const sanitizedFile = new File([originalFile], sanitizedFileName, {
        type: originalFile.type,
        lastModified: originalFile.lastModified
      });

      this.selectedFile = sanitizedFile;
      this.fileName = sanitizedFile.name;
      this.fileSelected.emit(sanitizedFile);
    } else {
      this.selectedFile = null;
      this.fileName = 'No file chosen';
      this.fileSelected.emit(null);
    }
  }

  openFileBrowser(): void {
    this.fileInputRef.nativeElement.click();
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileName = 'No file chosen';
    this.fileSelected.emit(null);
    if (this.fileInputRef && this.fileInputRef.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
}
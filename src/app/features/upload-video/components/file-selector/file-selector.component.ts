import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for ngIf, ngFor etc.

@Component({
  selector: 'app-file-selector',
  standalone: true, // IMPORTANT: Mark as standalone
  imports: [CommonModule], // Import dependencies directly
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'] // Assuming file exists
})
export class FileSelectorComponent implements OnChanges {
  @Output() fileSelected = new EventEmitter<File | null>();
  @Input() selectedFile: File | null = null;
  @Input() fileUploadProgress: number | null = null;
  @Input() isUploading: boolean = false;

  fileName: string = 'No file chosen';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedFile'] && changes['selectedFile'].currentValue !== changes['selectedFile'].previousValue) {
      this.fileName = this.selectedFile ? this.selectedFile.name : 'No file chosen';
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.fileName = file.name;
      this.fileSelected.emit(file);
    } else {
      this.selectedFile = null;
      this.fileName = 'No file chosen';
      this.fileSelected.emit(null);
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileName = 'No file chosen';
    this.fileSelected.emit(null);
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
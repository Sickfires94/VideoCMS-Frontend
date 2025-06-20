import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core'; // Import ViewChild, ElementRef
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

  // Add ViewChild to get a reference to the hidden file input element
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>; // Give your input a template reference variable

  fileName: string = 'No file chosen';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedFile'] && changes['selectedFile'].currentValue !== changes['selectedFile'].previousValue) {
      this.fileName = this.selectedFile ? this.selectedFile.name : 'No file chosen';
      // Reset the input value when selectedFile changes to null
      if (!this.selectedFile && this.fileInputRef && this.fileInputRef.nativeElement) {
          this.fileInputRef.nativeElement.value = '';
      }
    }
  }

  // This method will be called when the hidden file input's value changes
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file; // Update component's internal state
      this.fileName = file.name;
      this.fileSelected.emit(file); // Emit the file to the parent component
    } else {
      // If the user cancels the file selection dialog without choosing a file
      this.selectedFile = null;
      this.fileName = 'No file chosen';
      this.fileSelected.emit(null);
    }
  }

  // NEW: This method will be called when the "Browse" button is clicked
  openFileBrowser(): void {
    // Programmatically click the hidden file input element
    this.fileInputRef.nativeElement.click();
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileName = 'No file chosen';
    this.fileSelected.emit(null);
    // Directly reset the file input element's value
    if (this.fileInputRef && this.fileInputRef.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
}
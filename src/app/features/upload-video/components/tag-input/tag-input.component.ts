import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { CommonModule } from '@angular/common'; // Required for ngIf, ngFor etc.

@Component({
  selector: 'app-tag-input',
  standalone: true, // IMPORTANT: Mark as standalone
  imports: [CommonModule, ReactiveFormsModule], // Import dependencies directly
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.scss'] // Assuming file exists
})
export class TagInputComponent implements OnInit {
  @Input() suggestedTags: string[] = [];
  @Input() selectedTags: string[] = [];
  @Output() tagsChanged = new EventEmitter<string[]>();
  @Output() generateTags = new EventEmitter<void>();

  newTagControl = new FormControl('');

  ngOnInit(): void { }

  addTag(tag: string): void {
    const trimmedTag = tag.trim();
    if (trimmedTag && !this.selectedTags.includes(trimmedTag)) {
      this.selectedTags.push(trimmedTag);
      this.tagsChanged.emit(this.selectedTags);
      this.newTagControl.setValue('');
    }
  }

  removeTag(tag: string): void {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
    this.tagsChanged.emit(this.selectedTags);
  }

  onTagInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag(this.newTagControl.value || '');
    }
  }

  onSuggestedTagClick(tag: string): void {
    this.addTag(tag);
  }
}

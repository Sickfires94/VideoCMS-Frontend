import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for ngIf etc.

@Component({
  selector: 'app-message-box',
  standalone: true, // IMPORTANT: Mark as standalone
  imports: [CommonModule], // Import dependencies directly
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss']
})
export class MessageBoxComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message: string = '';
  @Input() showDismissButton: boolean = true;
  @Output() dismissed = new EventEmitter<void>();

  get classes(): string {
    switch (this.type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-700';
      case 'error': return 'bg-red-100 border-red-400 text-red-700';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info': return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  }

  get icon(): string {
    switch (this.type) {
      case 'success': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'; // Checkmark
      case 'error': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'; // X-mark
      case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'; // Exclamation triangle
      case 'info': return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'; // Info circle
    }
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}

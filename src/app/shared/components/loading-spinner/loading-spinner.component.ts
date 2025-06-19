import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for ngIf etc.

@Component({
  selector: 'app-loading-spinner',
  standalone: true, // IMPORTANT: Mark as standalone
  imports: [CommonModule], // Import dependencies directly
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = 'blue'; // Tailwind color like 'blue', 'gray', 'green'
}
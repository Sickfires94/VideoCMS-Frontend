// src/app/features/video-changelogs/components/log-card/log-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor, DatePipe
import { VideoMetadataChangeLog } from '../../../../shared/models/video-metadata-changelog';

@Component({
  selector: 'app-log-card',
  standalone: true,
  imports: [CommonModule], // Import CommonModule as it's a standalone component
  templateUrl: './log-card.component.html',
  styleUrls: ['./log-card.component.scss']
})
export class LogCardComponent {
  @Input() log!: VideoMetadataChangeLog; // Input property to receive a single log entry

  // Helper function to determine if a property has actually changed
  hasPropertyChanged(previousValue: any, updatedValue: any): boolean {
    // Check if either value is explicitly not null/undefined AND they are different
    return (previousValue !== null || updatedValue !== null) && previousValue !== updatedValue;
  }
}
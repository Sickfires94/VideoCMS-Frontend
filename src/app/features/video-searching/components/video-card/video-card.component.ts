// src/app/features/video-searching/components/video-card/video-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf
import { VideoMetadataSearchDto } from '../../models/videoMetadataSearchDto';

@Component({
  selector: 'app-video-card',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Import CommonModule
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.scss'] // Optional, if you have specific styles not covered by Tailwind
})
export class VideoCardComponent {
  @Input() video!: VideoMetadataSearchDto; // Input property for video data

  // Placeholder for missing thumbnails or dynamic generation if needed
  get thumbnailUrl(): string {
    // You can implement logic here to use a default image if video.thumbnailUrl is null/empty
    // For now, assuming video.videoUrl can serve as a placeholder or a default is set.
    return this.video.videoUrl || 'https://placehold.co/320x180/E0E0E0/757575?text=No+Thumbnail';
  }

  // Example: Format a date (you might add a pipe for this)
  get formattedUploadDate(): string {
    // For now, using a placeholder or assuming it's part of videoUrl logic if not explicit.
    return 'Uploaded: ' + new Date().toLocaleDateString(); // Replace with actual date logic
  }
}
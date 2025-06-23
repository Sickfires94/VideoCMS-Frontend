// src/app/features/video-detail/components/video-player/video-player.component.ts
import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf

@Component({
  selector: 'app-video-player',
  standalone: true, // Mark as standalone
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
})
export class VideoPlayerComponent implements OnChanges {
  @Input() videoUrl: string | null = null; // The URL of the video file

  // Use ViewChild to get a reference to the <video> element
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  // Flag to indicate if video is ready to play (can improve UX)
  isReadyToPlay: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl']) {
      // Reset readiness when URL changes
      this.isReadyToPlay = false;
      // If a new URL is provided, try to load it
      if (this.videoUrl && this.videoElement) {
        this.videoElement.nativeElement.load(); // Reload the video source
      }
    }
  }

  onCanPlay(): void {
    // This event fires when the browser can play the video
    this.isReadyToPlay = true;
    console.log('Video is ready to play.');
  }

  onError(event: Event): void {
    console.error('Video playback error:', event);
    // Optionally display an error message to the user
    // this.notificationService.showError('Error loading video. Please try again later.');
  }
}
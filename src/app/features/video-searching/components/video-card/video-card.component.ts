// src/app/features/video-searching/components/video-card/video-card.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VideoMetadataSearchDto } from '../../models/videoMetadataSearchDto';
import { HighlightPipe } from '../../../../shared/pipes/hightlight.pipe';

@Component({
  selector: 'app-video-card',
  standalone: true,
  // --- NEW: Add HighlightPipe to imports ---
  imports: [CommonModule, RouterModule, DatePipe, HighlightPipe],
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.scss']
})
export class VideoCardComponent implements OnInit {
  @Input() video!: VideoMetadataSearchDto;
  @Input() searchTerm: string = ''; // <--- NEW: Input for searchTerm

  ngOnInit(): void {
    // console.log('VideoCardComponent: Received video data for card:', this.video);
    // console.log('VideoCardComponent: Card searchTerm:', this.searchTerm);
  }

  get thumbnailUrl(): string {
    return this.video.videoUrl || 'https://placehold.co/320x180/E0E0E0/757575?text=No+Thumbnail';
  }
}
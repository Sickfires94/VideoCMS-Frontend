// src/app/features/video-searching/components/video-list/video-list.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoCardComponent } from '../video-card/video-card.component';
import { LoadingSpinnerComponent } from "../../../../shared/components/loading-spinner/loading-spinner.component";
import { VideoMetadataSearchDto } from '../../models/videoMetadataSearchDto';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, VideoCardComponent, LoadingSpinnerComponent],
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss']
})
export class VideoListComponent implements OnInit, OnChanges {
  @Input() videos: VideoMetadataSearchDto[] = [];
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() searchTerm: string = ''; // <--- NEW: Input for searchTerm

  ngOnInit(): void {
    // console.log('VideoListComponent: Initializing...');
    // console.log('VideoListComponent: Initial videos input:', this.videos);
    // console.log('VideoListComponent: Initial isLoading:', this.isLoading);
    // console.log('VideoListComponent: Initial errorMessage:', this.errorMessage);
    // console.log('VideoListComponent: Initial searchTerm:', this.searchTerm);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['videos']) {
    //   console.log('VideoListComponent: @Input videos changed to:', changes['videos'].currentValue);
    //   console.log('VideoListComponent: New videos array length:', changes['videos'].currentValue?.length || 0);
    // }
    // if (changes['isLoading']) {
    //   console.log('VideoListComponent: @Input isLoading changed to:', changes['isLoading'].currentValue);
    // }
    // if (changes['errorMessage']) {
    //   console.log('VideoListComponent: @Input errorMessage changed to:', changes['errorMessage'].currentValue);
    // }
    // if (changes['searchTerm']) { // Log searchTerm changes
    //   console.log('VideoListComponent: @Input searchTerm changed to:', changes['searchTerm'].currentValue);
    // }
    // console.log(`VideoListComponent: Current rendering state - !isLoading: ${!this.isLoading}, !errorMessage: ${!this.errorMessage}, videos.length > 0: ${this.videos.length > 0}`);
  }
}
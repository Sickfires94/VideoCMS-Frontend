// src/app/features/video-searching/components/video-list/video-list.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf, ngFor
import { VideoCardComponent } from '../video-card/video-card.component'; // Import standalone VideoCardComponent
import { LoadingSpinnerComponent } from "../../../../shared/components/loading-spinner/loading-spinner.component";
import { VideoMetadataSearchDto } from '../../models/videoMetadataSearchDto';


@Component({
  selector: 'app-video-list',
  standalone: true, // Mark as standalone
  imports: [CommonModule, VideoCardComponent, LoadingSpinnerComponent], // Import dependencies
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.scss'] // Optional
})
export class VideoListComponent {
  @Input() videos: VideoMetadataSearchDto[] = []; // Array of videos to display
  @Input() isLoading: boolean = false; // To show loading state
}
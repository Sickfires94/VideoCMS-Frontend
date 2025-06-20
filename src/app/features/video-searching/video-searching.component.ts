// src/app/features/video-searching/video-searching.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf
import { VideoSearchService } from './services/video-search.service'; // Import the new service
import { SearchBarComponent } from './components/search-bar/search-bar.component'; // Import standalone SearchBarComponent
import { VideoListComponent } from './components/video-list/video-list.component'; // Import standalone VideoListComponent
import { finalize } from 'rxjs/operators'; // For loading state management
import { PaginatedVideoResult } from '../../shared/models/PaginatedVideoResult';
import { VideoSearchQuery } from '../../shared/models/VideoSearchQuery';
import { VideoMetadataSearchDto } from './models/videoMetadataSearchDto';

@Component({
  selector: 'app-video-searching',
  standalone: true, // Mark as standalone
  imports: [CommonModule, SearchBarComponent, VideoListComponent], // Import dependencies
  templateUrl: './video-searching.component.html',
  styleUrls: ['./video-searching.component.scss'] // Optional
})
export class VideoSearchingComponent implements OnInit {
  videos: VideoMetadataSearchDto[] = [];
  isLoadingVideos: boolean = false;
  currentSearchQuery: VideoSearchQuery = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'uploadDate',
    sortDirection: 'desc'
  }; // Initial default query

  constructor(private videoSearchService: VideoSearchService) { }

  ngOnInit(): void {
    // Initial load of videos when the component mounts
    this.performSearch(this.currentSearchQuery);
  }

  /**
   * Handles the search event emitted by the SearchBarComponent.
   * @param query The search query object.
   */
  onSearch(query: VideoSearchQuery): void {
    // Update the current query, potentially resetting page number for new searches
    this.currentSearchQuery = { ...query, pageNumber: 1 }; // Always start from page 1 on new search criteria
    this.performSearch(this.currentSearchQuery);
  }

  /**
   * Performs the actual video search API call.
   * @param query The query parameters to use for the search.
   */
  performSearch(query: VideoSearchQuery): void {
    this.isLoadingVideos = true;
    this.videos = []; // Clear previous results while loading

    this.videoSearchService.searchVideos(query).pipe(
      finalize(() => this.isLoadingVideos = false) // Ensure loading state is reset
    ).subscribe({
      next: (result: PaginatedVideoResult) => {
        this.videos = result.items;
        // You might want to store totalCount, totalPages for pagination UI later
        console.log('Search Results:', result);
      },
      error: (err) => {
        console.error('Failed to perform video search:', err);
        // Notification service will show a global error message
      }
    });
  }

  // TODO: Add methods for pagination (next page, previous page) if needed later
}
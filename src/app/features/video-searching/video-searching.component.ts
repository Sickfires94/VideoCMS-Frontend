// src/app/features/video-searching/video-searching.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { VideoMetadataSearchDto } from './models/videoMetadataSearchDto'; // Your search-specific DTO


// --- CRITICAL: Ensure SearchBarComponent and VideoListComponent are correctly imported ---
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { VideoListComponent } from './components/video-list/video-list.component';
import { PaginatedVideoResult } from '../../shared/models/PaginatedVideoResult';
import { VideoSearchingService } from './services/video-search.service';

@Component({
  selector: 'app-video-searching',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // --- CRITICAL: List standalone components used in this template here ---
    SearchBarComponent, // This MUST be here for app-search-bar to be recognized
    VideoListComponent  // This MUST be here for app-video-list to be recognized
  ],
  templateUrl: './video-searching.component.html',
  styleUrls: ['./video-searching.component.scss']
})
export class VideoSearchingComponent implements OnInit, OnDestroy {
  videos: VideoMetadataSearchDto[] = [];
  isLoadingVideos: boolean = false;
  errorMessage: string | null = null;
  currentSearchTerm: string = ''; // State to hold the current search term

  private destroy$ = new Subject<void>();

  constructor(
    private videoSearchingService: VideoSearchingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to query parameters to handle initial load or URL changes
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const currentSearchTermFromUrl = params['searchTerm'] || '';

      // Only update and re-search if the search term from URL has actually changed
      // or if it's an initial load and no videos are present.
      if (this.currentSearchTerm !== currentSearchTermFromUrl || (this.videos.length === 0 && !this.isLoadingVideos && !this.errorMessage)) {
        this.currentSearchTerm = currentSearchTermFromUrl; // Update component's internal state
        this.performSearch(this.currentSearchTerm);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles the search submission event emitted by the SearchBarComponent.
   * This method receives the search term as a string.
   * @param searchTerm The search term from the SearchBar.
   */
  onSearchSubmitted(searchTerm: string): void {
    // Only update the URL if the new search term is different from the current one
    // This prevents unnecessary URL updates and re-triggers of the queryParams subscription
    if (this.currentSearchTerm !== searchTerm) {
      this.updateUrl(searchTerm); // Updating URL will trigger queryParams subscription, which calls performSearch
    } else {
      // If the search term is the same, directly re-run the search
      // (e.g., user hits Enter again on the same term, or selects it from suggestions)
      this.performSearch(searchTerm);
    }
  }

  /**
   * Executes the video search API call.
   * @param searchTerm The term to use for searching videos.
   */
  performSearch(searchTerm: string): void {
    this.isLoadingVideos = true;
    this.errorMessage = null;
    this.videos = []; // Clear previous results immediately

    this.videoSearchingService.searchVideos(searchTerm).pipe(
      finalize(() => {
        this.isLoadingVideos = false; // Always set loading to false when observable completes
      }),
      takeUntil(this.destroy$) // Ensure subscription is cleaned up
    ).subscribe({
      next: (result: PaginatedVideoResult) => {
        this.videos = result.items; // Assign the array of video objects
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'An unexpected error occurred while fetching videos.';
      }
    });
  }

  /**
   * Updates the browser's URL with the current search term as a query parameter.
   * @param searchTerm The search term to reflect in the URL.
   */
  updateUrl(searchTerm: string): void {
    const queryParams: any = {
      // Use null for an empty string to remove the query parameter from the URL
      searchTerm: searchTerm || null,
    };

    // Remove any parameters that are null (e.g., if searchTerm is empty)
    Object.keys(queryParams).forEach(key => queryParams[key] === null && delete queryParams[key]);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge' // Merge with any other existing query parameters
    });
  }
}
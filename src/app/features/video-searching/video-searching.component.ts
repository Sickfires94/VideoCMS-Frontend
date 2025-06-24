// src/app/features/video-searching/video-searching.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { PaginatedVideoResult } from '../../shared/models/PaginatedVideoResult';
import { VideoMetadataSearchDto } from './models/videoMetadataSearchDto'; // Assuming this is your DTO for displayed video cards

import { VideoSearchingService } from './services/video-search.service'; // Changed from video-searching.service to video-search.service
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { VideoListComponent } from './components/video-list/video-list.component';

@Component({
  selector: 'app-video-searching',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SearchBarComponent,
    VideoListComponent
  ],
  templateUrl: './video-searching.component.html',
  styleUrls: ['./video-searching.component.scss']
})
export class VideoSearchingComponent implements OnInit, OnDestroy {
  videos: VideoMetadataSearchDto[] = [];
  isLoadingVideos: boolean = false;
  errorMessage: string | null = null;
  currentSearchTerm: string = '';
  selectedCategoryName: string | undefined; // --- NEW: Track selected category name ---

  private destroy$ = new Subject<void>();

  constructor(
    private videoSearchingService: VideoSearchingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const currentSearchTermFromUrl = params['searchTerm'] || '';
      const selectedCategoryNameFromUrl = params['categoryName'] || undefined; // --- NEW: Get category from URL ---

      // Decide if a new search is needed based on changes in term or category
      if (this.currentSearchTerm !== currentSearchTermFromUrl || this.selectedCategoryName !== selectedCategoryNameFromUrl) {
          this.currentSearchTerm = currentSearchTermFromUrl;
          this.selectedCategoryName = selectedCategoryNameFromUrl;
          this.performSearch(this.currentSearchTerm, this.selectedCategoryName);
      } else if (this.videos.length === 0 && !this.isLoadingVideos && !this.errorMessage && currentSearchTermFromUrl === '' && selectedCategoryNameFromUrl === undefined) {
          // Initial load with no params and no videos loaded yet
          this.performSearch('', undefined);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- FIX: Updated signature to accept object from search bar ---
  onSearchSubmitted(searchData: { term: string, categoryName?: string }): void {
    const newSearchTerm = searchData.term;
    const newCategoryName = searchData.categoryName;

    if (this.currentSearchTerm !== newSearchTerm || this.selectedCategoryName !== newCategoryName) {
      this.updateUrl(newSearchTerm, newCategoryName);
    } else {
      // If term and category are the same, just re-run the search
      this.performSearch(newSearchTerm, newCategoryName);
    }
  }

  // --- FIX: Updated performSearch signature ---
  performSearch(searchTerm: string, categoryName?: string): void {
    this.isLoadingVideos = true;
    this.errorMessage = null;
    this.videos = [];

    // --- FIX: Pass categoryName to service ---
    this.videoSearchingService.searchVideos(searchTerm, categoryName).pipe(
      finalize(() => {
        this.isLoadingVideos = false;
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result: PaginatedVideoResult) => {
        this.videos = result.items;
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'An unexpected error occurred while fetching videos.';
      }
    });
  }

  // --- FIX: Updated updateUrl signature ---
  updateUrl(searchTerm: string, categoryName?: string): void {
    const queryParams: any = {
      searchTerm: searchTerm || null,
      categoryName: categoryName || null, // --- NEW: Add categoryName to URL ---
    };

    Object.keys(queryParams).forEach(key => queryParams[key] === null && delete queryParams[key]);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
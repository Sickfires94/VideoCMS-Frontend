// src/app/features/video-searching/services/video-search.service.ts
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service'; // Import ApiService
import { NotificationService } from '../../../core/services/notification.service'; // Import NotificationService
import { CategoryDto } from '../../../shared/models/category';
import { PaginatedVideoResult } from '../../../shared/models/PaginatedVideoResult';

@Injectable({
  providedIn: 'root'
})
export class VideoSearchingService {
  // Base URLs, assuming ApiService handles the root API path (e.g., 'http://localhost:5000/api')
  private readonly videoSearchRelativeUrl = '/video/search';
  private readonly categoriesRelativeUrl = '/Categories';

  constructor(
    private apiService: ApiService, // Use ApiService
    private notificationService: NotificationService // Inject NotificationService
  ) { }

  /**
   * Searches for videos with an optional search term and category filter.
   * @param searchTerm The main search query.
   * @param selectedCategoryName Optional: The name of the category to filter by (includes its descendants).
   */
  searchVideos(searchTerm?: string, selectedCategoryName?: string): Observable<PaginatedVideoResult> {
    let params = new HttpParams();

    if (searchTerm) {
      params = params.append('query', searchTerm);
    }

    if (selectedCategoryName && selectedCategoryName !== 'All Categories') {
      params = params.append('categoryName', selectedCategoryName);
      console.log(`VideoSearchingService: Searching videos with category: ${selectedCategoryName}`);
    } else {
      console.log('VideoSearchingService: No specific category selected, or "All Categories" selected.');
    }

    const url = `${this.videoSearchRelativeUrl}`;

    return this.apiService.get<PaginatedVideoResult>(url, { params }).pipe( // Use apiService.get
      tap(result => console.log('VideoSearchService: Search API success:', result)),
      catchError(error => {
        const errorMessage = `Failed to search videos. Details: ${error.message || 'Unknown error'}`;
        this.notificationService.showError(errorMessage); // Use NotificationService
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Fetches search suggestions based on a query.
   * @param query The search query for suggestions.
   * @returns An Observable of an array of string suggestions.
   */
  getSearchSuggestions(query: string): Observable<string[]> {
    if (!query || query.length < 2) {
      return of([]);
    }
    const params = new HttpParams().append('query', query);
    const url = `${this.videoSearchRelativeUrl}/suggestions`;

    return this.apiService.get<string[]>(url, { params }).pipe( // Use apiService.get
      tap(suggestions => console.log('VideoSearchingService: Suggestions API success:', suggestions)),
      // catchError(error => {
      //   const errorMessage = `Failed to get search suggestions. Details: ${error.message || 'Unknown error'}`;
      //   this.notificationService.showError(errorMessage); // Use NotificationService
      //   console.error(errorMessage, error);
      //   return throwError(() => new Error(errorMessage));
      // })
    );
  }

  /**
   * Fetches the full category hierarchy from the backend.
   * Assumes a backend endpoint like /api/Categories/Tree
   * @returns An Observable of an array of top-level CategoryDto with nested children.
   */
  getCategoriesTree(): Observable<CategoryDto[]> {
    const url = `${this.categoriesRelativeUrl}/Tree`;

    return this.apiService.get<CategoryDto[]>(url).pipe( // Use apiService.get
      tap(categories => console.log('VideoSearchingService: Categories tree fetched:', categories)),
      catchError(error => {
        const errorMessage = `Failed to load categories. Details: ${error.message || 'Unknown error'}`;
        this.notificationService.showError(errorMessage); // Use NotificationService
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Searches categories by name using the backend API.
   * Uses the /api/Categories/search/{categoryName} endpoint.
   * @param categoryName The name or partial name of the category to search for.
   * @returns An Observable of an array of matching CategoryDto objects.
   */
  searchCategories(categoryName: string): Observable<CategoryDto[]> {
    if (!categoryName || categoryName.trim() === '') {
      return of([]);
    }
    const encodedCategoryName = encodeURIComponent(categoryName);
    const url = `${this.categoriesRelativeUrl}/search/${encodedCategoryName}`;

    return this.apiService.get<CategoryDto[]>(url).pipe( // Use apiService.get
      tap(results => console.log('VideoSearchingService: Category search API success:', results)),
      catchError(error => {
        const errorMessage = `Failed to search categories. Details: ${error.message || 'Unknown error'}`;
        this.notificationService.showError(errorMessage); // Use NotificationService
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
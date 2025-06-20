// src/app/features/video-searching/services/video-search.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpClient and HttpParams
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PaginatedVideoResult } from '../../../shared/models/PaginatedVideoResult';
import { VideoSearchQuery } from '../../../shared/models/VideoSearchQuery';

@Injectable({
  providedIn: 'root' // Provided at root for global access
})
export class VideoSearchService {
  private readonly baseUrl = '/video'; // Assuming your backend video search endpoint is something like /api/videos/search

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private http: HttpClient // Direct HttpClient can be used, but apiService is better for consistency and error handling
  ) { }

  /**
   * Searches for videos based on the provided query parameters.
   * Assumes a backend endpoint like GET /api/videos/search?searchTerm=...&categoryId=...
   * @param query The VideoSearchQuery object containing search criteria.
   * @returns An Observable that emits PaginatedVideoResult.
   */
  searchVideos(query: VideoSearchQuery): Observable<PaginatedVideoResult> {
    let params = new HttpParams();

    // Dynamically add parameters only if they exist in the query object
    if (query.searchTerm) {
      params = params.set('query', query.searchTerm);
    }
    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId);
    }
    // if (query.tagIds && query.tagIds.length > 0) {
    //   // For multiple tag IDs, you might need to join them or add multiple params
    //   // Backend should be configured to handle this (e.g., ?tagIds=id1&tagIds=id2 or ?tagIds=id1,id2)
    //   // Assuming backend handles comma-separated for simplicity or multiple params
    //   params = params.set('tagIds', query.tagIds.join(',')); // Example: "id1,id2,id3"
    // }
    // if (query.sortBy) {
    //   params = params.set('sortBy', query.sortBy);
    // }
    // if (query.sortDirection) {
    //   params = params.set('sortDirection', query.sortDirection);
    // }
    // if (query.pageNumber) {
    //   params = params.set('pageNumber', query.pageNumber.toString());
    // }
    // if (query.pageSize) {
    //   params = params.set('pageSize', query.pageSize.toString());
    // }

    const url = `${this.baseUrl}/search`; // Example backend search path

    return this.apiService.get<PaginatedVideoResult>(url, {params}).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to search videos. Please try again.');
        console.error('Error searching videos:', error);
        return throwError(() => new Error('Video search failed.'));
      })
    );
  }
}
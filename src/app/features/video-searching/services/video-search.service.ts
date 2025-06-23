// src/app/features/video-searching/services/video-searching.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
// --- FIX: Ensure VideoMetadataDto is imported correctly based on new names ---
import { VideoMetadataDto } from '../../../shared/models/video';
import { PaginatedResponse } from '../../../shared/models/common';
import { PaginatedVideoResult } from '../../../shared/models/PaginatedVideoResult';

@Injectable({
  providedIn: 'root'
})
export class VideoSearchingService {
  private readonly baseUrl = '/video/search';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  searchVideos(searchTerm?: string): Observable<PaginatedVideoResult> {
    const params = new URLSearchParams();
    if (searchTerm) params.append('query', searchTerm);

    const url = `${this.baseUrl}/?${params.toString()}`;

    return this.apiService.get<PaginatedVideoResult>(url).pipe(
      catchError(error => {
        const errorMessage = `Failed to search videos. Details: ${error.message || 'Unknown error'}`;
        this.notificationService.showError(errorMessage);
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getSearchSuggestions(query: string): Observable<string[]> {
    if (!query || query.length < 2) {
      return new Observable<string[]>(observer => { observer.next([]); observer.complete(); });
    }
    const params = new URLSearchParams();
    params.append('query', query);

    const url = `${this.baseUrl}/suggestions?${params.toString()}`;

    return this.apiService.get<string[]>(url).pipe(
      catchError(error => {
        const errorMessage = `Failed to get search suggestions. Details: ${error.message || 'Unknown error'}`;
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
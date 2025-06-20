import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TagsGenerationService {
  // This endpoint '/api/tags/generate' is NOT present in your OpenAPI spec.
  // It is assumed to exist on your backend for AI tag generation.
  private readonly baseUrl = '/tags';

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * Requests the backend to generate suggested tags based on video name and description.
   * @param videoName The name of the video.
   * @param videoDescription The description of the video.
   * @returns An Observable that emits an array of suggested tag names (strings).
   */
  generateTags(videoName: string, videoDescription: string): Observable<string[]> {
    // Construct query parameters
    let params = new HttpParams()
      .set('title', videoName) // Query parameter name 'title'
      .set('description', videoDescription); // Query parameter name 'description'

    // The endpoint path remains the same, but now we pass params
    const url = `${this.baseUrl}/generate`;

    // Change to GET request and pass the HttpParams object directly
    // FIX: Removed the extra object literal { params: params }
    return this.apiService.get<string[]>(url, {params}).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to generate tags. Please try again.');
        console.error('Error generating tags:', error);
        return throwError(() => new Error('Tag generation failed.'));
      })
    );
  }
}

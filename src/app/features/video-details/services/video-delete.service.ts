// src/app/features/video-detail/services/video-delete.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Injectable({
  providedIn: 'root' // Ensures it's a singleton and accessible throughout the app
})
export class VideoDeleteService {
  // Assuming your backend delete endpoint is DELETE /api/videos/{id} or /videoMetadata/{id}
  // Adjust 'baseUrl' to match your actual backend delete endpoint
  private readonly baseUrl = '/videoMetadata'; // Example: consistent with your update service

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * Sends a DELETE request to remove a video by its ID.
   *
   * @param videoId The ID (string) of the video to delete.
   * @returns An Observable that completes on successful deletion, or emits an error.
   */
  deleteVideo(videoId: number): Observable<void> { // Use 'void' as response if backend returns 204 No Content
    if (!videoId) {
      const errorMsg = 'Video ID is required for deletion.';
      this.notificationService.showError(errorMsg);
      console.error(errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    const url = `${this.baseUrl}/${videoId}`; // Construct the full URL for the DELETE request

    // Call the API service's delete method
    return this.apiService.delete<void>(url, {params: {}, responseType: 'text'}).pipe(
      catchError(error => {
        const errorMessage = `Failed to delete video (ID: ${videoId}). Details: ${error.message || 'Unknown error'}`;
        this.notificationService.showError(errorMessage);
        console.error(errorMessage, error);
        // Re-throw the error to allow the component to handle it if needed
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
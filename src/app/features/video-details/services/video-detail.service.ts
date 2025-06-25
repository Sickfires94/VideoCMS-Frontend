// src/app/features/video-detail/services/video-detail.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VideoMetadataDto } from '../../../shared/models/video';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root' // Provided at root for global access
})
export class VideoDetailService {
  private readonly videoBaseUrl = '/VideoMetadata'; // Assuming backend video endpoint is /api/videos
  private readonly sasGenerationBaseUrl = '/video/blob'; // Endpoint for SAS generation (e.g., GET /api/blob/generate-download-sas)

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * Fetches a single video by its ID from the backend.
   * Assumes a backend endpoint like GET /api/videos/{id}
   * @param videoId The ID of the video to fetch.
   * @returns An Observable that emits the VideoMetadataDto.
   */
  getVideoById(videoId: number): Observable<VideoMetadataDto> {
    if (!videoId) {
      const errorMsg = 'Video ID is required to fetch video details.';
      this.notificationService.showError(errorMsg);
      console.error(errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    if(isNaN(Number(videoId))){
        const errorMsg = 'Video ID should be a number';
      this.notificationService.showError(errorMsg);
      console.error(errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    const metadataUrl = `${this.videoBaseUrl}/${videoId}`; // e.g., /api/videos/123

    return this.apiService.get<VideoMetadataDto>(metadataUrl).pipe(
      switchMap(videoMetadata => {
        if (!videoMetadata || !videoMetadata.videoUrl) {
          const errorMsg = `Video metadata or public video URL not found for ID: ${videoId}`;
          this.notificationService.showError(errorMsg);
          return throwError(() => new Error(errorMsg));
        }

        // --- CHANGE HERE: Pass videoMetadata.videoUrl (the full public URL) directly ---
        return this.getPlayableVideoUrl(videoMetadata.videoUrl).pipe(
          tap(sasUrl => {
            videoMetadata.playableVideoUrl = sasUrl;
          }),
          map(() => videoMetadata), // Return the enriched videoMetadata
          catchError(sasError => {
            console.warn(`Could not generate SAS URL for video ${videoId}. Video might not be playable.`, sasError);
            this.notificationService.showWarning(`Failed to get playable link for video ${videoMetadata.videoName}.`);
            return of(videoMetadata); // Still return videoMetadata, but without playable URL
          })
        );
      }),
      catchError(error => {
        const errorMessage = `Failed to load video details for ID: ${videoId}.`;
        this.notificationService.showError(errorMessage);
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  

  private getPlayableVideoUrl(fullBlobUrl: string): Observable<string> {
    const url = `${this.sasGenerationBaseUrl}/generate-download-sas`; // Your backend endpoint
    
    // Construct HttpParams. The parameter name 'fileUrl' MUST match your backend controller's parameter name.
    let params = new HttpParams().set('fileUrl', fullBlobUrl); 

    // This is the correct way to use apiService.get (or HttpClient.get) with query parameters:
    // Pass the HttpParams object directly as the second argument.
    return this.apiService.get<string>(url, {params: params, responseType: 'text'},).pipe(
      catchError(error => {
        const errorMessage = `Failed to get download link from backend for URL: ${fullBlobUrl}.`;
        console.error(errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
}
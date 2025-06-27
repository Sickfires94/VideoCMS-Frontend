// src/app/features/update-video/services/video-update.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VideoMetadataDto, videoMetadataRequestDto } from '../../../shared/models/video';
import { UploadVideoForm } from '../../upload-video/models/upload';
import { VideoMetadataUpdateDto } from '../../../shared/models/RequestDtos/video';

@Injectable({
  providedIn: 'root' // Ensures it's a singleton and accessible throughout the app
})
export class VideoUpdateService {
  private readonly baseUrl = '/videoMetadata'; // Backend API base URL for videos

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * Sends an update request for video metadata to the backend.
   * Assumes a PUT /api/videos/{videoId} endpoint that accepts a DTO.
   *
   * @param videoId The ID of the video to update.
   * @param updateForm The form data containing the updated metadata from the frontend.
   * @returns An Observable that emits the updated VideoMetadataDto received from the backend.
   */
  updateVideo(videoId: number, UpdatedVideoMetadata: VideoMetadataDto): Observable<VideoMetadataDto> {
    if (!videoId) {
      const errorMsg = 'Video ID is required for updating video details.';
      this.notificationService.showError(errorMsg);
      console.error(errorMsg);
      return throwError(() => new Error(errorMsg));
    }

    // Construct the payload for the backend.
    // Important: Adapt this payload exactly to what your backend's PUT /api/videos/{id} endpoint expects.
    // For metadata updates, `videoFile` should not be included here.
    const updatePayload: videoMetadataRequestDto = {
      videoName: UpdatedVideoMetadata.videoName,
      videoDescription: UpdatedVideoMetadata.videoDescription,
      videoId: UpdatedVideoMetadata.videoId,
      videoTags: UpdatedVideoMetadata.videoTags ?? [],
      categoryName: UpdatedVideoMetadata.categoryName ?? undefined
    };
    const url = `${this.baseUrl}/${videoId}`;

    return this.apiService.post<VideoMetadataDto>(url, updatePayload).pipe(
      catchError(error => {
        const errorMessage = `Failed to update video`;
        this.notificationService.showError(errorMessage);
        console.error(errorMessage, error);
        // Re-throw the error to allow component to handle it if needed
        return throwError(() => new Error(errorMessage));
      })
    );

    
  }
}
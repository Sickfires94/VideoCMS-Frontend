import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VideoMetadataDto } from '../../../shared/models/video';


@Injectable({
  providedIn: 'root'
})
export class VideoMetadataService {
  private readonly baseUrl = '/VideoMetadata'; // Base URL for video metadata API

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) { }

  /**
   * Submits the final video metadata to the backend for persistence.
   * Maps frontend VideoMetadataDto to backend's VideoMetadata schema.
   * @param metadata The VideoMetadataDto object containing all video details.
   * @returns An Observable that emits the persisted VideoMetadataDto (possibly with generated ID).
   */
  submitVideoMetadata(metadata: VideoMetadataDto): Observable<VideoMetadataDto> {
    // Backend expects 'videoName', 'videoDescription', 'videoUrl', 'videoTags', 'categoryId', 'userId'
    // Frontend `VideoMetadataDto` now matches the backend `VideoMetadata` schema more closely.
    // For 'videoTags', frontend sends TagDto objects { tagId?: number, tagName: string }.
    // Backend is assumed to handle tagId = 0/null for new tags or lookup existing ones by name.
    const payload = {
      videoName: metadata.videoName,
      videoDescription: metadata.videoDescription,
      videoUrl: metadata.videoUrl,
      videoTags: metadata.videoTags || [], // Ensure it's an array, even if empty
      categoryId: metadata.category?.categoryId,
      userId: metadata.userId
      // videoUploadDate and videoUpdatedDate are backend-generated
      // videoId is backend-generated
    };

    return this.apiService.post<VideoMetadataDto>(this.baseUrl, payload).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to save video metadata.');
        console.error('Error submitting video metadata:', error);
        // Backend could return specific validation errors, which you might want to parse here
        return throwError(() => new Error('Video metadata submission failed.'));
      })
    );
  }
}

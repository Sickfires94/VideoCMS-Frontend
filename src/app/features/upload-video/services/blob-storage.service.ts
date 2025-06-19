import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpEventType, HttpEvent } from '@angular/common/http'; // Keep HttpClient for progress reporting
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {
  private readonly uploadUrl = '/upload'; // Direct endpoint from OpenAPI

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private http: HttpClient // Still use HttpClient directly for progress events with FormData
  ) { }

  /**
   * Uploads a file directly to the backend's /upload endpoint using multipart/form-data.
   * @param file The File object to upload.
   * @returns An Observable that emits HttpEvents for progress, or completes on success.
   */
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file, file.name); // 'file' matches the OpenAPI schema property name

    // Use HttpClient.post directly to get HttpEventType for progress
    return this.http.post(this.uploadUrl, formData, {
      reportProgress: true,
      observe: 'events' // Observe all events including progress
    }).pipe(
      catchError(error => {
        this.notificationService.showError('File upload failed.');
        console.error('Error uploading file:', error);
        return throwError(() => new Error('File upload failed.'));
      })
    );
  }
}
// src/app/services/blob-storage.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpEventType, HttpEvent, HttpParams, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../../core/api/api.service'; // Ensure this import is correct
import { NotificationService } from '../../../core/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {
  private readonly BlobBaseUrl = '/video/Blob'; // Relative path for ApiService

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private http: HttpClient // Still needed for direct PUT to Azure Blob Storage
  ) { }

  uploadFileWithSas(file: File): Observable<HttpEvent<any>> {
    const fileName = file.name;
    console.log("Getting SAS Token: Initiating request for file:", fileName);

    let params = new HttpParams().set("filename", fileName);

    // Call ApiService to get the SAS URI (passing responseType: 'text')
    // This call will now correctly use the simplified ApiService
    return this.apiService.get<string>(`${this.BlobBaseUrl}/generate-upload-sas`, {
      params: params,
      responseType: 'text' // This is the crucial part for ApiService
    }).pipe(
      tap(sasUriFromBackend => {
        console.log('TAP: Received raw SAS URI from backend (before switchMap):', sasUriFromBackend);
        if (!sasUriFromBackend || typeof sasUriFromBackend !== 'string' || sasUriFromBackend.trim() === '') {
          console.error('TAP: SAS URI received from backend is empty or not a string!', sasUriFromBackend);
          throw new Error('Invalid SAS URI received from backend.');
        }
      }),
      switchMap((sasUri: string) => {
        console.log('SWITCHMAP: Inside switchMap. SAS URI for upload:', sasUri);
        if (!sasUri || typeof sasUri !== 'string' || sasUri.trim() === '') {
            console.error('SWITCHMAP: SAS URI is invalid or empty, cannot proceed with upload!', sasUri);
            return throwError(() => new Error('Invalid SAS URI received from backend.'));
        }

        const headers = new HttpHeaders({
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type
        });

        // This PUT request directly to Azure Blob Storage still needs 'observe: "events"'
        // so it uses this.http (the direct HttpClient instance), not apiService.
        return this.http.put(sasUri, file, {
          headers: headers,
          reportProgress: true,
          observe: 'events' // Explicitly asking for events for progress updates
        });
      }),
      catchError(error => {
        let errorMessage = 'File upload failed.';
        if (error.url && error.url.includes('generate-upload-sas')) {
            if (error.status === 400 && error.error) {
                errorMessage = `SAS request failed (400): ${error.error}`;
            } else if (error.status === 500) {
                errorMessage = 'Failed to get upload authorization (500). Please check backend logs.';
            } else {
                errorMessage = `Failed to get upload authorization: ${error.message || 'Unknown network error'}`;
            }
            console.error('Error fetching SAS URI:', error);
        } else if (error.url && error.url.includes('blob.core.windows.net')) {
            errorMessage = 'Direct upload to storage failed. Check SAS permissions, CORS, or network.';
            console.error('Error from Azure Blob Storage (PUT request):', error);
        } else if (error.message === 'Invalid SAS URI received from backend.') {
            errorMessage = 'Upload cancelled: Invalid SAS URI was provided by the backend.';
            console.error('Internal logic error:', error);
        } else {
            console.error('General upload error:', error);
        }

        this.notificationService.showError(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getDownloadSasUri(fileName: string): Observable<string> {
    let params = new HttpParams().set('fileName', fileName);

    // Call ApiService to get the SAS URI (passing responseType: 'text')
    return this.apiService.get<string>(`${this.BlobBaseUrl}/generate-download-sas`, {
      params: params,
      responseType: 'text' // This is the crucial part for ApiService
    }).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to get download link.');
        console.error('Error getting download SAS URI:', error);
        return throwError(() => new Error('Failed to get download link.'));
      })
    );
  }
}
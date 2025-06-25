// src/app/features/upload-video/services/blob-storage.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError, from, Subject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http'; // Added HttpParams here if you use it for download
import { ApiService } from '../../../core/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';

// Corrected import for TransferProgressEvent
import { BlobServiceClient, AnonymousCredential, BlobHTTPHeaders, BlockBlobClient } from '@azure/storage-blob';
import { TransferProgressEvent } from '@azure/core-rest-pipeline'; // <--- CORRECTED IMPORT PATH
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {
  private readonly BlobBaseUrl = '/video/Blob';
  private readonly defaultBlobBlockSize = 4 * 1024 * 1024; // 4 MB

  private _uploadProgressSubject = new Subject<HttpEvent<any>>();
  public readonly uploadProgress$ = this._uploadProgressSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private http: HttpClient
  ) { }

  /**
   * Uploads a file to Azure Blob Storage using the Azure SDK.
   * Progress is emitted via the `uploadProgress$` observable.
   */
  uploadFileWithSas(file: File, containerName: string, prefix: string): Observable<string> {
    const sanitizedPrefix = prefix.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const fileName = sanitizedPrefix + "-" + dateTimestampProvider.now() + "-" + file.name;
    console.log("BlobStorageService: Initiating SAS token request for file:", fileName);

    this._uploadProgressSubject.next({ type: HttpEventType.Sent } as HttpEvent<any>);

    // 1. Get SAS URI from backend
    return this.apiService.get<string>(`${this.BlobBaseUrl}/generate-upload-sas`, {
      params: { filename: fileName, containerName: containerName },
      responseType: 'text'
    }).pipe(
      tap(sasUriFromBackend => {
        if (!sasUriFromBackend || typeof sasUriFromBackend !== 'string' || sasUriFromBackend.trim() === '') {
          throw new Error('Invalid SAS URI received from backend.');
        }
        console.log('BlobStorageService: Received SAS URI from backend.');
      }),
      switchMap((sasUri: string) => {
        const blockBlobClient = new BlockBlobClient(sasUri);

        const blobHttpHeaders: BlobHTTPHeaders = {
          blobContentType: file.type
        };

        // 3. Use the SDK's uploadBrowserData method for chunked upload
        return from(
          blockBlobClient.uploadBrowserData(file, {
            blockSize: this.defaultBlobBlockSize,
            maxSingleShotSize: this.defaultBlobBlockSize,
            blobHTTPHeaders: blobHttpHeaders,
            onProgress: (progress: TransferProgressEvent) => { // Type 'progress' correctly
              this._uploadProgressSubject.next({
                type: HttpEventType.UploadProgress,
                loaded: progress.loadedBytes,
                total: file.size
              } as HttpEvent<any>);
            }
          })
        ).pipe(
          tap(() => {
            this._uploadProgressSubject.next({
              type: HttpEventType.Response,
              status: 200,
              statusText: 'OK',
              url: blockBlobClient.url,
              ok: true,
              body: { fileName: fileName, url: blockBlobClient.url }
            } as HttpEvent<any>);
            console.log(`BlobStorageService: File "${fileName}" uploaded successfully via SDK!`);
          }),
          switchMap(() => {
            return new Observable<string>(observer => {
              const finalUrl = blockBlobClient.url.split('?')[0];
              observer.next(finalUrl);
              observer.complete();
            });
          }),
          catchError(uploadError => {
            console.error('BlobStorageService: Error during SDK upload:', uploadError);
            this.notificationService.showError('File upload to Azure failed during transfer.');
            this._uploadProgressSubject.error(uploadError);
            return throwError(() => new Error('Azure Blob SDK upload failed.'));
          })
        );
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
            console.error('BlobStorageService: Error fetching SAS URI:', error);
        } else if (error.message === 'Invalid SAS URI received from backend.') {
            errorMessage = 'Upload cancelled: Invalid SAS URI was provided by the backend.';
            console.error('BlobStorageService: Internal logic error (invalid SAS):', error);
        } else {
            console.error('BlobStorageService: General upload error in main pipe:', error);
        }
        this.notificationService.showError(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getDownloadSasUri(fileName: string): Observable<string> {
    let params = new HttpParams().set('fileName', fileName);

    return this.apiService.get<string>(`${this.BlobBaseUrl}/generate-download-sas`, {
      params: params,
      responseType: 'text'
    }).pipe(
      catchError(error => {
        this.notificationService.showError('Failed to get download link.');
        console.error('Error getting download SAS URI:', error);
        return throwError(() => new Error('Failed to get download link.'));
      })
    );
  }
}
// src/app/core/api/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../services/token-storage.service'; // Import TokenStorageService

// Define a simpler options interface, focusing on responseType for 'body' observation
export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[]; };
  params?: HttpParams | { [param: string]: string | string[]; };
  // Only include responseType here, observe is implicitly 'body' for these methods
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseApiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private tokenStorageService: TokenStorageService // Inject TokenStorageService
  ) { }

  /**
   * Adds the Authorization header with the Bearer token if available from TokenStorageService.
   * @param existingHeaders Existing HttpHeaders or object of headers.
   * @returns HttpHeaders with Authorization header added.
   */
  private addAuthHeader(existingHeaders?: HttpHeaders | { [header: string]: string | string[]; }): HttpHeaders {
    let headers = existingHeaders instanceof HttpHeaders ? existingHeaders : new HttpHeaders(existingHeaders || {});
    const token = this.tokenStorageService.getToken(); // <<< FIX: Get token from TokenStorageService

    if (token && !headers.has('Authorization')) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      // console.log('ApiService: Attaching Bearer token to request.'); // For debugging
    } else if (!token) {
      // console.warn('ApiService: No JWT token found via TokenStorageService for authenticated request.');
    }
    return headers;
  }

  private formatErrors(error: any): Observable<never> {
    const errorMessage = error.error?.message || error.statusText || 'An unknown API error occurred.';
    console.error('API Call Error:', error);
    // this.notificationService.showError(errorMessage); // Display error to user
    return throwError(() => error);
  }

  /**
   * Performs a generic GET request to the API.
   * @param path The API endpoint path.
   * @param options Optional HTTP request options including params, headers, and responseType.
   * @returns An Observable that emits the response body of type T.
   */
  get<T>(
    path: string,
    options?: ApiRequestOptions
  ): Observable<T> {
    const httpOptions = {
      headers: this.addAuthHeader(options?.headers), // Automatically add Auth header
      params: options?.params instanceof HttpParams ? options.params : new HttpParams({ fromObject: (options?.params as any) || {} }),
      responseType: options?.responseType,
    };
    return this.sendRequest<T>('GET', path, null, httpOptions);
  }

  /**
   * Performs a generic POST request to the API.
   * @param path The API endpoint path.
   * @param body The request body.
   * @param options Optional HTTP headers and responseType.
   * @returns An Observable that emits the response body of type T.
   */
  post<T>(
    path: string,
    body: Object = {},
    options?: ApiRequestOptions
  ): Observable<T> {
    const httpOptions = {
      headers: this.addAuthHeader(options?.headers), // Automatically add Auth header
      params: options?.params instanceof HttpParams ? options.params : new HttpParams({ fromObject: (options?.params as any) || {} }),
      responseType: options?.responseType,
    };
    return this.sendRequest<T>('POST', path, body, httpOptions);
  }

  /**
   * Performs a generic PUT request to the API.
   * @param path The API endpoint path.
   * @param body The request body.
   * @param options Optional HTTP headers and responseType.
   * @returns An Observable that emits the response body of type T.
   */
  put<T>(
    path: string,
    body: Object = {},
    options?: ApiRequestOptions
  ): Observable<T> {
    const httpOptions = {
      headers: this.addAuthHeader(options?.headers), // Automatically add Auth header
      params: options?.params instanceof HttpParams ? options.params : new HttpParams({ fromObject: (options?.params as any) || {} }),
      responseType: options?.responseType,
    };
    return this.sendRequest<T>('PUT', path, body, httpOptions);
  }

  /**
   * Performs a generic DELETE request to the API.
   * @param path The API endpoint path.
   * @param options Optional HTTP headers and responseType.
   * @returns An Observable that emits the response body of type T.
   */
  delete<T>(
    path: string,
    options?: ApiRequestOptions
  ): Observable<T> {
    const httpOptions = {
      headers: this.addAuthHeader(options?.headers), // Automatically add Auth header
      params: options?.params instanceof HttpParams ? options.params : new HttpParams({ fromObject: (options?.params as any) || {} }),
      responseType: options?.responseType,
    };
    return this.sendRequest<T>('DELETE', path, null, httpOptions);
  }

  /**
   * Internal helper to send the HTTP request with proper type casting.
   */
  private sendRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body: Object | null,
    httpOptions: any // Using 'any' due to HttpClient overloads based on responseType
  ): Observable<T> {
    const url = `${this.baseApiUrl}${path}`;

    let requestObservable: Observable<any>; // Use any here for the intermediate type

    switch (method) {
      case 'GET':
        requestObservable = this.http.get(url, httpOptions);
        break;
      case 'POST':
        requestObservable = this.http.post(url, body, httpOptions);
        break;
      case 'PUT':
        requestObservable = this.http.put(url, body, httpOptions);
        break;
      case 'DELETE':
        requestObservable = this.http.delete(url, httpOptions);
        break;
      default:
        return throwError(() => new Error('Unsupported HTTP method.'));
    }

    return requestObservable.pipe(
      catchError(this.formatErrors.bind(this))
    ) as Observable<T>;
  }
}
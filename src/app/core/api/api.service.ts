// src/app/core/api/api.service.ts
// MODEL: Provides a generic HTTP client for interacting with the backend API.
// It centralizes API base URL, common headers, and error handling.

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service'; // Path to your NotificationService
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root' // This service is a singleton and provided at the root level
})
export class ApiService {
  // Centralized API base URL, typically configured in environment files
  private baseApiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient, // Angular's HTTP client for making requests
    private notificationService: NotificationService // Injected for centralized error notifications
  ) { }

  /**
   * A private helper method to format and handle API errors.
   * It extracts an error message and displays it using the NotificationService.
   * @param error The HTTP error response.
   * @returns An Observable that emits an error.
   */
  private formatErrors(error: any): Observable<never> {
    const errorMessage = error.error?.message || error.statusText || 'An unknown API error occurred.';
    // Display a user-friendly error notification
    // this.notificationService.showError(`API Error: ${errorMessage}`);
    // Log the full error details for debugging
    console.error('API Call Error:', error);
    // Re-throw the error for the calling service/component to handle if needed
    return throwError(() => error);
  }

  /**
   * Performs a generic GET request to the API.
   * @param path The API endpoint path (e.g., '/users', '/videos/123').
   * @param params Optional HTTP parameters to be appended to the URL.
   * @param headers Optional HTTP headers to be included in the request.
   * @returns An Observable that emits the response body of type T.
   */
  get<T>(
    path: string,
    params: HttpParams = new HttpParams(),
    headers: HttpHeaders = new HttpHeaders()
  ): Observable<T> {
    return this.http.get<T>(`${this.baseApiUrl}${path}`, { headers, params }).pipe(
      catchError(this.formatErrors.bind(this)) // Bind 'this' to ensure context for formatErrors
    );
  }

  /**
   * Performs a generic POST request to the API.
   * @param path The API endpoint path.
   * @param body The request body (object that will be JSON.stringified).
   * @param headers Optional HTTP headers.
   * @returns An Observable that emits the response body of type T.
   */
  post<T>(
    path: string,
    body: Object = {},
    headers: HttpHeaders = new HttpHeaders()
  ): Observable<T> {
    return this.http.post<T>(`${this.baseApiUrl}${path}`, body, { headers }).pipe(
      catchError(this.formatErrors.bind(this))
    );
  }

  /**
   * Performs a generic PUT request to the API.
   * @param path The API endpoint path.
   * @param body The request body.
   * @param headers Optional HTTP headers.
   * @returns An Observable that emits the response body of type T.
   */
  put<T>(
    path: string,
    body: Object = {},
    headers: HttpHeaders = new HttpHeaders()
  ): Observable<T> {
    return this.http.put<T>(`${this.baseApiUrl}${path}`, body, { headers }).pipe(
      catchError(this.formatErrors.bind(this))
    );
  }

  /**
   * Performs a generic DELETE request to the API.
   * @param path The API endpoint path.
   * @param headers Optional HTTP headers.
   * @returns An Observable that emits the response body of type T.
   */
  delete<T>(
    path: string,
    headers: HttpHeaders = new HttpHeaders()
  ): Observable<T> {
    return this.http.delete<T>(`${this.baseApiUrl}${path}`, { headers }).pipe(
      catchError(this.formatErrors.bind(this))
    );
  }
}

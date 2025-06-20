// src/app/core/api/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

// Define a simpler options interface, focusing on responseType for 'body' observation
export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[]; };
  params?: HttpParams | { [param: string]: string | string[]; };
  // Only include responseType here, observe is implicitly 'body' for these methods
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  // Do NOT include 'observe' directly if you only want 'body' responses by default.
  // If you need 'observe: "events"' or 'observe: "response"', you'd use HttpClient directly
  // or use the more complex ApiService pattern from the previous answer.
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseApiUrl = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  private formatErrors(error: any): Observable<never> {
    const errorMessage = error.error?.message || error.statusText || 'An unknown API error occurred.';
    console.error('API Call Error:', error);
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
    options?: ApiRequestOptions // Use the simplified options
  ): Observable<T> {
    const httpOptions = {
      headers: options?.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options?.headers || {}),
      params: options?.params instanceof HttpParams ? options.params : new HttpParams({ fromObject: (options?.params as any) || {} }),
      responseType: options?.responseType, // Pass responseType directly
      // observe is implicitly 'body' here
    };

    // Need to cast to the specific response type for HttpClient.get overloads
    // HttpClient.get<string>(..., {responseType: 'text'})
    // HttpClient.get<any>(..., {responseType: 'json'}) (default)
    if (options?.responseType === 'text') {
      return this.http.get(`${this.baseApiUrl}${path}`, { ...httpOptions, responseType: 'text' }) as Observable<T>;
    } else if (options?.responseType === 'blob') {
        return this.http.get(`${this.baseApiUrl}${path}`, { ...httpOptions, responseType: 'blob' }) as Observable<T>;
    } else if (options?.responseType === 'arraybuffer') {
        return this.http.get(`${this.baseApiUrl}${path}`, { ...httpOptions, responseType: 'arraybuffer' }) as Observable<T>;
    }
    // Default to JSON parsing if responseType is 'json' or not specified
    return this.http.get<T>(`${this.baseApiUrl}${path}`, { ...httpOptions, responseType: 'json' }).pipe(
      catchError(this.formatErrors.bind(this))
    );
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
      headers: options?.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options?.headers || {}),
      params: options?.params instanceof HttpParams ? options.params : new HttpParams({ fromObject: (options?.params as any) || {} }),
      responseType: options?.responseType,
    };

    if (options?.responseType === 'text') {
      return this.http.post(`${this.baseApiUrl}${path}`, body, { ...httpOptions, responseType: 'text' }) as Observable<T>;
    } else if (options?.responseType === 'blob') {
        return this.http.post(`${this.baseApiUrl}${path}`, body, { ...httpOptions, responseType: 'blob' }) as Observable<T>;
    } else if (options?.responseType === 'arraybuffer') {
        return this.http.post(`${this.baseApiUrl}${path}`, body, { ...httpOptions, responseType: 'arraybuffer' }) as Observable<T>;
    }
    return this.http.post<T>(`${this.baseApiUrl}${path}`, body, { ...httpOptions, responseType: 'json' }).pipe(
      catchError(this.formatErrors.bind(this))
    );
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
      headers: options?.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options?.headers || {}),
      params: options?.params instanceof HttpParams ? options.params : new HttpParams({ fromObject: (options?.params as any) || {} }),
      responseType: options?.responseType,
    };

    if (options?.responseType === 'text') {
      return this.http.put(`${this.baseApiUrl}${path}`, body, { ...httpOptions, responseType: 'text' }) as Observable<T>;
    } else if (options?.responseType === 'blob') {
        return this.http.put(`${this.baseApiUrl}${path}`, body, { ...httpOptions, responseType: 'blob' }) as Observable<T>;
    } else if (options?.responseType === 'arraybuffer') {
        return this.http.put(`${this.baseApiUrl}${path}`, body, { ...httpOptions, responseType: 'arraybuffer' }) as Observable<T>;
    }
    return this.http.put<T>(`${this.baseApiUrl}${path}`, body, { ...httpOptions, responseType: 'json' }).pipe(
      catchError(this.formatErrors.bind(this))
    );
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
      headers: options?.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options?.headers || {}),
      params: options?.params instanceof HttpParams ? options.params : new HttpParams({ fromObject: (options?.params as any) || {} }),
      responseType: options?.responseType,
    };

    if (options?.responseType === 'text') {
      return this.http.delete(`${this.baseApiUrl}${path}`, { ...httpOptions, responseType: 'text' }) as Observable<T>;
    } else if (options?.responseType === 'blob') {
        return this.http.delete(`${this.baseApiUrl}${path}`, { ...httpOptions, responseType: 'blob' }) as Observable<T>;
    } else if (options?.responseType === 'arraybuffer') {
        return this.http.delete(`${this.baseApiUrl}${path}`, { ...httpOptions, responseType: 'arraybuffer' }) as Observable<T>;
    }
    return this.http.delete<T>(`${this.baseApiUrl}${path}`, { ...httpOptions, responseType: 'json' }).pipe(
      catchError(this.formatErrors.bind(this))
    );
  }
}
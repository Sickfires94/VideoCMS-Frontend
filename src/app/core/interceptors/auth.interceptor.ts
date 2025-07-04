// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor // IMPORTANT: Ensure HttpInterceptor is imported
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service'; // Adjust path if necessary
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor { // <-- Define AuthInterceptor as a class implementing HttpInterceptor

  constructor(private tokenStorageService: TokenStorageService) {}

  /**
   * Intercepts outgoing HTTP requests to add an Authorization header if a token exists.
   * @param request The outgoing HttpRequest.
   * @param next The next HttpHandler in the chain.
   * @returns An Observable of HttpEvent.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.tokenStorageService.getToken(); // Retrieve the authentication token

    const isApiRequest = request.url.startsWith(environment.apiBaseUrl);

    // Only add the Authorization header if a token exists AND it's an API request
    if (token && isApiRequest) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Pass the cloned request (with or without the header) to the next handler in the chain
    return next.handle(request);
  }
}

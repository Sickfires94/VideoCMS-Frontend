// src/app/features/auth/services/auth-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { LoginPayload } from '../models/login-payload.model';
import { RegisterPayload } from '../models/register-payload.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({
  providedIn: 'root' // Provided globally, used by AuthFacade
})
export class AuthApiService {
  // Centralize API URLs, potentially in an environment file
  private authApiPath = '/Users';

  constructor(private apiService: ApiService) {}

  /**
   * Sends login credentials to the backend API.
   * @param payload User's username and password.
   * @returns An Observable of AuthResponse containing token and user info.
   */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.authApiPath}/login`, payload);
  }

  /**
   * Sends registration details to the backend API.
   * @param payload User's registration data (username, email, password).
   * @returns An Observable of AuthResponse upon successful registration.
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.authApiPath}/register`, payload);
  }

  // Future methods:
  // forgotPassword(email: string): Observable<any> { ... }
  // resetPassword(payload: ResetPasswordPayload): Observable<any> { ... }
  // verifyEmail(token: string): Observable<any> { ... }
}
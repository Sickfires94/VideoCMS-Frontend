// src/app/features/auth/services/auth-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { LoginRequestDto } from '../models/RequestDtos/LoginRequestDto';
import { RegisterRequestDto } from '../models/RequestDtos/RegisterRequestDto';
import { LoginResponseDto } from '../models/ResponseDtos/LoginResponseDto';
import { UserResponseDto } from '../models/ResponseDtos/UserResponseDto';

@Injectable({
  providedIn: 'root' // Provided globally, used by AuthFacade
})
export class AuthApiService {
  // Centralize API URLs, potentially in an environment file
  private authApiPath = '/Users';

  constructor(private apiService: ApiService) {}

  login(payload: LoginRequestDto): Observable<LoginResponseDto> {
    return this.apiService.post<LoginResponseDto>(`${this.authApiPath}/login`, payload);
  }

  register(payload: RegisterRequestDto): Observable<UserResponseDto> {
    return this.apiService.post<UserResponseDto>(`${this.authApiPath}/register`, payload);
  }
}
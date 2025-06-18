// src/app/features/auth/services/auth.facade.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { AuthResponse } from '../models/auth-response.model';
import { LoginPayload } from '../models/login-payload.model';
import { RegisterPayload } from '../models/register-payload.model';
import { User } from '../models/user.model';
import { AuthApiService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
// FIX: Ensure 'export' keyword is present here
export class AuthFacade {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$: Observable<boolean> = this._isAuthenticated.asObservable();

  private _currentUser = new BehaviorSubject<User | null>(null);
  public readonly currentUser$: Observable<User | null> = this._currentUser.asObservable();

  constructor(
    private authApi: AuthApiService,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    this.initializeAuthStatus();
  }

  private initializeAuthStatus(): void {
    const token = this.tokenStorage.getToken();
    const user = this.tokenStorage.getUser();
    if (token && user) {
      this.setAuthenticatedState(user);
    }
  }

  private setAuthenticatedState(user: User): void {
    this._isAuthenticated.next(true);
    this._currentUser.next(user);
  }

  public login(payload: LoginPayload): Observable<AuthResponse> {
    return this.authApi.login(payload).pipe(
        tap((response: AuthResponse) => {
          this.tokenStorage.saveToken(response.token);
          this.tokenStorage.saveUser(response.user);
          this.setAuthenticatedState(response.user);
          this.router.navigateByUrl('/dashboard');
        }),
      catchError(error => {
        console.error('AuthFacade: Login error', error);
        return throwError(() => error);
      })
    );
  }

  public register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.authApi.register(payload).pipe(
      tap((response: AuthResponse) => {
        this.tokenStorage.saveToken(response.token);
        this.tokenStorage.saveUser(response.user);
        this.setAuthenticatedState(response.user);
        this.router.navigateByUrl('/dashboard');
      }),
      catchError(error => {
        console.error('AuthFacade: Registration error', error);
        return throwError(() => error);
      })
    );
  }

  public logout(): void {
    this.tokenStorage.clear();
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
    this.router.navigateByUrl('/login');
  }
 
  public getToken(): string | null {
    return this.tokenStorage.getToken();
  }
}
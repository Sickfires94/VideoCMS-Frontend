// src/app/features/auth/services/auth.facade.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { User } from '../models/user.model';
import { AuthApiService } from './auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoginRequestDto } from '../models/RequestDtos/LoginRequestDto';
import { LoginResponseDto } from '../models/ResponseDtos/LoginResponseDto';
import { RegisterRequestDto } from '../models/RequestDtos/RegisterRequestDto';
import { UserResponseDto } from '../models/ResponseDtos/UserResponseDto';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$: Observable<boolean> = this._isAuthenticated.asObservable();

  private _currentUser = new BehaviorSubject<User | null>(null);
  public readonly currentUser$: Observable<User | null> = this._currentUser.asObservable();

  constructor(
    private authApi: AuthApiService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private notificationService: NotificationService // Inject NotificationService
  ) {
    this.initializeAuthStatus();
  }

  private initializeAuthStatus(): void {
    const token = this.tokenStorage.getToken();
    const user = this.tokenStorage.getUser();
    console.log(`Setting Auth user to: ${user?.userId} ` )
    if (token && user) {
      this.setAuthenticatedState(user);
    }
  }

  private setAuthenticatedState(user: User): void {
    this._isAuthenticated.next(true);
    this._currentUser.next(user);
  }

  public login(payload: LoginRequestDto): Observable<LoginResponseDto> {
    return this.authApi.login(payload).pipe(
      tap((response: LoginResponseDto) => {
        console.log(`Response: ${response.token}`)
        this.tokenStorage.saveToken(response.token);
        const user = response.user;
        this.tokenStorage.saveUser(user);
        this.setAuthenticatedState(user);
        this.notificationService.showSuccess('Login successful!'); // Success notification
        this.router.navigateByUrl('/search'); // Or wherever your main app dashboard is
      }),
      catchError(error => {
        console.error('AuthFacade: Login error', error);
        // ApiService already shows a generic error, but you can add more specific ones here if needed
        this.notificationService.showError('Login failed. Please check your credentials.');
        return throwError(() => error);
      })
    );
  }

  public register(payload: RegisterRequestDto): Observable<UserResponseDto> {
    return this.authApi.register(payload).pipe(
      tap((response: UserResponseDto) => {
        // console.log(`Response: ${response.user.token}`)
        this.router.navigateByUrl('/login');
      }),
      catchError(error => {
        console.error('AuthFacade: Registration error', error);
        this.notificationService.showError('Registration failed. Please try again.');
        return throwError(() => error);
      })
    );
  }



  public logout(): void {
    this.tokenStorage.clear();
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
    //this.notificationService.showInfo('You have been logged out.'); // Info notification
    this.router.navigateByUrl('/login');
  }

  public getUser() : User | null{
    return this.tokenStorage.getUser()
  }

  public getUserId() : number | null {
    return this.tokenStorage.getUser()?.userId ?? null
  }

  public getToken(): string | null {
    return this.tokenStorage.getToken();
  }
}
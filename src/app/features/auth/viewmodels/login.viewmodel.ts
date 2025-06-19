// src/app/features/auth/viewmodels/login.viewmodel.ts
import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthFacade } from '../services/auth.facade';
import { LoginPayload } from '../models/login-payload.model';

@Injectable() // Not a global singleton; provided per component instance
export class LoginViewModel {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);

  public loginForm: FormGroup;
  private _isLoading = new BehaviorSubject<boolean>(false);
  public readonly isLoading$: Observable<boolean> = this._isLoading.asObservable();
  private _errorMessage = new BehaviorSubject<string | null>(null);
  public readonly errorMessage$: Observable<string | null> = this._errorMessage.asObservable();

  constructor() {
    this.loginForm = this.fb.group({
      userEmail: ['', Validators.required],
      userPassword: ['', Validators.required]
    });
  }

  // Public getters for form controls to bind in template
  get usernameControl() {
    return this.loginForm.get('userEmail');
  }
  get passwordControl() {
    return this.loginForm.get('userPassword');
  }

  /**
   * Handles the login form submission.
   * - Validates the form.
   * - Calls the AuthFacade to perform login.
   * - Manages loading state and error messages.
   */
  public login(): void {
    this._errorMessage.next(null); // Clear previous errors
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Show validation errors
      this._errorMessage.next('Please fill in all required fields.');
      return;
    }

    this._isLoading.next(true);
    const payload: LoginPayload = this.loginForm.value;

    this.authFacade.login(payload).subscribe({
      next: () => {
        // Success: AuthFacade handles navigation
        this._isLoading.next(false);
        this.loginForm.reset(); // Optionally reset form
      },
      error: (err) => {
        this._isLoading.next(false);
        // Extract a user-friendly message from the error response
        this._errorMessage.next(err.error?.message || 'Login failed. Please check your credentials.');
        console.error('LoginViewModel error:', err);
      }
    });
  }

  /**
   * Resets the form and any associated messages.
   */
  public resetForm(): void {
    this.loginForm.reset();
    this._errorMessage.next(null);
    this._isLoading.next(false);
  }
}
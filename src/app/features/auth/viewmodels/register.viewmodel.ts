// src/app/features/auth/viewmodels/register.viewmodel.ts
import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { RegisterPayload } from '../models/register-payload.model';
import { AuthFacade } from '../services/auth.facade';

@Injectable() // Not a global singleton; provided per component instance
export class RegisterViewModel {
  private fb = inject(FormBuilder);
  private authFacade : AuthFacade = inject(AuthFacade);

  public registerForm: FormGroup;
  private _isLoading = new BehaviorSubject<boolean>(false);
  public readonly isLoading$: Observable<boolean> = this._isLoading.asObservable();
  private _errorMessage = new BehaviorSubject<string | null>(null);
  public readonly errorMessage$: Observable<string | null> = this._errorMessage.asObservable();

  constructor() {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password confirmation
  private passwordMatchValidator(form: FormGroup) {
    const userPassword = form.get('userPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return userPassword === confirmPassword ? null : { mismatch: true };
  }

  // Public getters for form controls
  get usernameControl() { return this.registerForm.get('username'); }
  get emailControl() { return this.registerForm.get('userEmail'); }
  get passwordControl() { return this.registerForm.get('userPassword'); }
  get confirmPasswordControl() { return this.registerForm.get('confirmPassword'); }

  /**
   * Handles the registration form submission.
   * - Validates the form (including password match).
   * - Calls the AuthFacade to perform registration.
   * - Manages loading state and error messages.
   */
  public register(): void {
    this._errorMessage.next(null);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this._errorMessage.next('Please correct the errors in the form.');
      return;
    }

    this._isLoading.next(true);
    // Destructure to exclude confirmPassword from payload sent to API
    const { confirmPassword, ...payload } = this.registerForm.value as RegisterPayload & { confirmPassword: string };

    this.authFacade.register(payload).subscribe({
      next: () => {
        // Success: AuthFacade handles navigation
        this._isLoading.next(false);
        this.registerForm.reset();
      },
      error: (err: any) => {
        this._isLoading.next(false);
        this._errorMessage.next(err.error?.message || 'Registration failed. Please try again.');
        console.error('RegisterViewModel error:', err);
      }
    });
  }

  /**
   * Resets the form and any associated messages.
   */
  public resetForm(): void {
    this.registerForm.reset();
    this._errorMessage.next(null);
    this._isLoading.next(false);
  }
}
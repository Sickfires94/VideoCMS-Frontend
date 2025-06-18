// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PublicGuard } from '../../core/guards/public.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [PublicGuard] // Protects from logged-in users
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [PublicGuard] // Protects from logged-in users
  },
  // Add other auth routes like 'forgot-password', 'reset-password' here
];
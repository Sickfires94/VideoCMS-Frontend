// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Provides router functionality
    provideHttpClient(withInterceptors([AuthInterceptor])), // Provides HttpClient with your interceptor
    // Other root-level services (AuthFacade, TokenStorageService, Guards) are providedIn: 'root'
    // so they don't need explicit listing here.
  ]
};
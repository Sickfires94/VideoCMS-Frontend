// src/app/app.config.ts
import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  HttpInterceptorFn,
  HttpHandler // Import HttpHandler
} from '@angular/common/http';

import { routes } from './app.routes'; // Your application's root routes

// Import your singleton services and interceptor class
import { ApiService } from './core/api/api.service';
import { NotificationService } from './core/services/notification.service';
import { TokenStorageService } from './core/services/token-storage.service';
import { AuthInterceptor } from './core/interceptors/auth.interceptor'; // Your class-based interceptor
import { AuthFacade } from './features/auth/services/auth.facade';

// Define a functional interceptor that wraps your class-based one
const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const authInterceptor = inject(AuthInterceptor); // Inject the class instance

  // Create an HttpHandler object that wraps the functional 'next'
  const httpHandler: HttpHandler = {
    handle: (request) => next(request) // The handle method simply calls the functional 'next'
  };

  // Call the class-based interceptor's 'intercept' method with the wrapped HttpHandler
  return authInterceptor.intercept(req, httpHandler); // Fix applied here
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Provide HttpClient with interceptors
    provideHttpClient(
      withInterceptors([
        authInterceptorFn // Use the functional interceptor wrapper
      ])
    ),

    // Provide your singleton services and the AuthInterceptor class itself (so it can be injected)
    ApiService,
    NotificationService,
    TokenStorageService,
    NotificationService,
    AuthFacade,
    AuthInterceptor, // Provide the class itself so it can be injected by `inject(AuthInterceptor)`
  ]
};

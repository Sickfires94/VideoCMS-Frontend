import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
// HttpClientModule and HTTP_INTERCEPTORS are provided via `app.config.ts` now, so they are not needed here.

// Core services
import { ApiService } from './api/api.service';
import { NotificationService } from './services/notification.service';
import { TokenStorageService } from './services/token-storage.service';

// Core components - GlobalNotificationComponent is standalone and imported directly by AppComponent.
// So it is NOT declared or exported here.

// Core interceptors - provided in app.config.ts

// Shared module - SharedModule's components are standalone, so SharedModule itself might not be strictly needed here.
// import { SharedModule } from '../shared/shared.module'; // Remove this import as it's not needed by this NgModule anymore.

@NgModule({
  declarations: [
    // IMPORTANT: Standalone components are NOT declared here.
    // This array MUST be empty.
  ],
  imports: [
    CommonModule // Only import CommonModule if this NgModule itself needs its directives
  ],
  providers: [
    ApiService,
    NotificationService,
    TokenStorageService,
    // Interceptor provided in app.config.ts, so remove it from here.
    // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  exports: [
    // IMPORTANT: Standalone components are NOT exported from NgModules.
    // This array MUST be empty.
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
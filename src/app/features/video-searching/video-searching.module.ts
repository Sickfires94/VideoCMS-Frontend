// src/app/features/video-searching/video-searching.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // Still needed for general Angular directives if used directly in this module's context

// No declarations here because all components are standalone
// No direct component imports here because standalone components are imported directly by other standalone components

// Import services as they are @Injectable and need to be provided
import { VideoSearchService } from './services/video-search.service';
import { VideoSearchingRoutingModule } from './videoSearching.routes';

@NgModule({
  declarations: [
    // IMPORTANT: Standalone components are NOT declared here.
    // This array should be empty.
  ],
  imports: [
    CommonModule, // Provide CommonModule if this module's other aspects use its directives (e.g., if you had non-standalone components in future)
    VideoSearchingRoutingModule // Imports the feature's routing
  ],
  providers: [
    VideoSearchService // Provide the service here, or at 'root' as done above.
                       // 'providedIn: root' in the service itself is generally preferred.
  ]
})
export class VideoSearchingModule { }
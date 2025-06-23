// src/app/features/video-searching/video-searching.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoSearchingComponent } from './video-searching.component'; // Import the standalone component
import { VideoSearchingRoutingModule } from './videoSearching.routes';

// --- IMPORTANT: Ensure VideoSearchingService is NOT imported here ---
// If you had:
// import { VideoSearchingService } from './services/video-searching.service';
// DELETE THAT LINE.

@NgModule({
  // No 'declarations' needed for standalone components
  declarations: [],
  imports: [
    CommonModule,
    VideoSearchingRoutingModule,
  ],
  providers: [
    // VideoSearchingService uses `providedIn: 'root'`, so it should NOT be listed here.
  ]
})
export class VideoSearchingModule { }
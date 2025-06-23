// src/app/features/video-detail/video-detail-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoDetailComponent } from './video-detail.component'; // Import the standalone component

const routes: Routes = [
  {
    path: ':id', // This path segment will capture the video ID (e.g., /video/123)
    component: VideoDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoDetailRoutingModule { }
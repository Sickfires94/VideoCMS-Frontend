// src/app/features/video-detail/video-detail.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoDetailRoutingModule } from './video-detail-routing.module';
// No declarations or direct imports of standalone components here.

@NgModule({
  declarations: [], // Should be empty for standalone components
  imports: [
    CommonModule,
    VideoDetailRoutingModule
  ],
  providers: [
    // VideoDetailService is providedIn: 'root', so no need to list here
  ]
})
export class VideoDetailModule { }
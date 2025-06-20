// src/app/features/video-searching/video-searching-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoSearchingComponent } from './video-searching.component'; // Import the standalone component

const routes: Routes = [
  {
    path: '', // Route for /video-searching
    component: VideoSearchingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoSearchingRoutingModule { }
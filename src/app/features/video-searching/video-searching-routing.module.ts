// src/app/features/video-searching/video-searching-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoSearchingComponent } from './video-searching.component'; // Correctly imported here for routing

const routes: Routes = [
  {
    path: '', // For /search route
    component: VideoSearchingComponent // Referenced directly as the component for the route
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoSearchingRoutingModule { }
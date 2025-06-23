// src/app/features/update-video/update-video-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdateVideoComponent } from './update-video.component';

const routes: Routes = [
  {
    path: ':id', // Defines a route like `/update-video/123`
    component: UpdateVideoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpdateVideoRoutingModule { }
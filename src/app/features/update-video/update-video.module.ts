// src/app/features/update-video/update-video.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateVideoRoutingModule } from './update-video.routing.module';

@NgModule({
  declarations: [], // Standalone components don't need to be declared here
  imports: [
    CommonModule,
    UpdateVideoRoutingModule
  ],
  providers: [] // Services are providedIn: 'root'
})
export class UpdateVideoModule { }
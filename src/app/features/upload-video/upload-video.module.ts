import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { UploadVideoRoutingModule } from './upload-video-routing.module';

// Import services as usual (they are @Injectable and not components)
import { BlobStorageService } from './services/blob-storage.service';
import { TagsGenerationService } from './services/tags-generation.service';
import { CategoryService } from './services/category.service';
import { VideoMetadataService } from './services/video-metadata.service';

@NgModule({
  declarations: [
    // IMPORTANT: Standalone components are NOT declared here.
    // This array MUST be empty.
  ],
  imports: [
    CommonModule,
    UploadVideoRoutingModule,
    ReactiveFormsModule,
    FormsModule
    // IMPORTANT: Standalone components (UploadVideoComponent, VideoUploadFormComponent, etc.)
    // are NOT imported into the 'imports' array of an NgModule that uses them for routing
    // or if they are self-contained.
    // UploadVideoComponent is standalone and imported via routing.
    // VideoUploadFormComponent is standalone and imported by UploadVideoComponent.
    // So, no component imports are needed here.
  ],
  providers: [
    BlobStorageService,
    TagsGenerationService,
    CategoryService,
    VideoMetadataService
  ]
})
export class UploadVideoModule { }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for CommonModule directives
import { VideoUploadFormComponent } from './components/video-upload-form/video-upload-form.component'; // Import standalone component

@Component({
  selector: 'app-upload-video',
  standalone: true, // IMPORTANT: Mark as standalone
  imports: [CommonModule, VideoUploadFormComponent], // Import dependencies directly
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.scss'] // Assuming file exists
})
export class UploadVideoComponent {
  // This component acts as a wrapper for the upload video feature.
  // Most of the logic resides in VideoUploadFormComponent.
}
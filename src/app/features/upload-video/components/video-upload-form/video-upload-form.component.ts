// src/app/pages/video/video-upload-form/video-upload-form.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BlobStorageService } from '../../services/blob-storage.service'; // Ensure this is the updated service
import { TagsGenerationService } from '../../services/tags-generation.service';
import { VideoMetadataService } from '../../services/video-metadata.service';

import { finalize } from 'rxjs/operators';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FileSelectorComponent } from '../file-selector/file-selector.component';
import { TagInputComponent } from '../tag-input/tag-input.component';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';

import { Subscription } from 'rxjs'; // Still needed for authSubscription
import { NotificationService } from '../../../../core/services/notification.service';
import { CategoryDto } from '../../../../shared/models/category';
import { TagDto } from '../../../../shared/models/tag';
import { VideoMetadataDto, videoMetadataRequestDto } from '../../../../shared/models/videoMetadata';
import { User } from '../../../auth/models/user.model';
import { AuthFacade } from '../../../auth/services/auth.facade';
import { Router } from '@angular/router';


@Component({
  selector: 'app-video-upload-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FileSelectorComponent,
    TagInputComponent,
    CategorySelectorComponent
  ],
  templateUrl: './video-upload-form.component.html',
  styleUrls: ['./video-upload-form.component.scss']
})
export class VideoUploadFormComponent implements OnInit, OnDestroy {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  suggestedTags: string[] = [];
  selectedTags: string[] = [];
  selectedCategory: CategoryDto | null = null;

  isGeneratingTags: boolean = false;
  isUploadingFile: boolean = false;
  isFileUploaded: boolean = false;
  fileUploadProgress: number | null = 0; // Initialize to 0 for progress bar display
  isSubmittingMetadata: boolean = false;

  private uploadedVideoUrl: string | null = null;
  private currentUserId: number | null = null;
  private authSubscription!: Subscription;
  private uploadProgressSubscription!: Subscription; // New subscription for upload progress

  // Define your Azure Blob Storage container name here
  private readonly AZURE_CONTAINER_NAME = 'videos'; // <--- IMPORTANT: Configure your container name

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private blobStorageService: BlobStorageService,
    private tagsGenerationService: TagsGenerationService,
    private videoMetadataService: VideoMetadataService,
    private notificationService: NotificationService,
    private authFacade: AuthFacade
  ) { }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.authSubscription = this.authFacade.currentUser$.subscribe(
      (user: User | null) => {
        if (user && user.userId) {
          this.currentUserId = user.userId;
        } else {
          this.currentUserId = null;
        }
      }
    );

    // Subscribe to the upload progress observable from the BlobStorageService
    this.uploadProgressSubscription = this.blobStorageService.uploadProgress$.subscribe({
      next: (event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            this.isUploadingFile = true;
            this.fileUploadProgress = 0;
            this.notificationService.showInfo('Starting video upload...');
            console.log('Upload started.');
            break;
          case HttpEventType.UploadProgress:
            this.isUploadingFile = true; // Ensure this is true during progress
            this.fileUploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
            console.log(`Upload progress: ${this.fileUploadProgress}%`);
            break;
          case HttpEventType.Response: // This indicates the SDK's upload operation completed
            this.isUploadingFile = false;
            this.fileUploadProgress = 100;
            this.isFileUploaded = true;
            // The response body from the service's HttpEventType.Response can contain the URL
            if (event.body && event.body.url) {
                this.uploadedVideoUrl = event.body.url.split('?')[0]; // Remove SAS params
            } else {
                // Fallback or error if URL not in body (should be fixed if backend gives direct SAS to blob)
                this.notificationService.showWarning('Upload completed, but direct video URL not received. Attempting to derive from filename.');
                // Assuming standard Azure Blob URL structure
                this.uploadedVideoUrl = `https://<your-storage-account-name>.blob.core.windows.net/${this.AZURE_CONTAINER_NAME}/${this.selectedFile?.name}`;
            }
            this.notificationService.showSuccess('Video file uploaded successfully!');
            console.log('Video file uploaded successfully:', this.uploadedVideoUrl);
            // Proceed to submit metadata after successful file upload
            this.submitMetadata();
            break;
        }
      },
      error: (err: any) => {
        console.error('Video file upload failed via progress stream:', err);
        // Notification for error should already be shown by BlobStorageService.
        this.resetFormOnUploadError();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    // Unsubscribe from the upload progress observable
    if (this.uploadProgressSubscription) {
      this.uploadProgressSubscription.unsubscribe();
    }
  }

  onFileSelected(file: File | null): void {
    this.selectedFile = file;
    this.isFileUploaded = false;
    this.fileUploadProgress = 0; // Reset progress bar to 0
    this.uploadedVideoUrl = null;
    this.isUploadingFile = false; // Not uploading until onSubmit
    this.suggestedTags = []; // Clear suggested tags on new file selection
    this.selectedTags = []; // Clear selected tags on new file selection
  }

  onTagsChanged(tags: string[]): void {
    this.selectedTags = tags;
  }

  onCategorySelected(category: CategoryDto | null): void {
    this.selectedCategory = category;
  }

  generateSuggestedTags(): void {
    const name = this.uploadForm.get('name')?.value;
    const description = this.uploadForm.get('description')?.value;

    if (!name || !description) {
      this.notificationService.showWarning('Please enter video name and description to generate tags.');
      return;
    }

    this.isGeneratingTags = true;
    this.tagsGenerationService.generateTags(name, description).pipe(
      finalize(() => this.isGeneratingTags = false)
    ).subscribe({
      next: (tags: string[]) => {
        this.suggestedTags = tags;
        this.notificationService.showSuccess('AI suggested tags generated!');
      },
      error: (err: any) => {
        console.error('Failed to generate suggested tags:', err);
        this.notificationService.showError('Failed to generate suggested tags.');
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.uploadForm.invalid) {
      this.notificationService.showError('Please fill in all required fields (Name, Description).');
      this.uploadForm.markAllAsTouched();
      return;
    }
    if (!this.selectedFile) {
      this.notificationService.showError('Please select a video file to upload.');
      return;
    }
    if (!this.selectedCategory) {
      this.notificationService.showError('Please select a category for the video.');
      return;
    ;
    }
    // if (this.selectedTags.length === 0) {
    //   this.notificationService.showWarning('Please add at least one tag for the video.');
    // }
    if (this.currentUserId === null) {
      this.notificationService.showError('User not logged in. Cannot upload video.');
      return;
    }

    // Reset upload state before starting a new upload
    this.isUploadingFile = true;
    this.fileUploadProgress = 0;
    this.isFileUploaded = false;
    this.uploadedVideoUrl = null;
    this.isSubmittingMetadata = false; // Ensure this is also reset

    const name = this.uploadForm.get('name')?.value
    try {
      // Initiate the file upload. The progress and final URL will come via the uploadProgress$ subscription.
      this.blobStorageService.uploadFileWithSas(this.selectedFile , this.AZURE_CONTAINER_NAME, name)
        .subscribe({
          // The main observable from uploadFileWithSas now only signifies initiation and errors
          // for the *overall process* of getting a SAS and starting the SDK upload.
          // Actual upload progress and completion comes from the `uploadProgress$` subject.
          next: () => {
            console.log('Blob upload initiation successful (main observable).');
            // Do not set isUploadingFile = false here; it's managed by the progress subscription
          },
          error: (err: any) => {
            // This error handles failures *before* the SDK upload starts (e.g., SAS token generation failure)
            console.error('Upload initiation failed (main observable error):', err);
            // Notifications are already handled by the service and progress stream for most errors
            this.resetFormOnUploadError();
          },
          complete: () => {
            console.log('Blob upload initiation observable completed.');
            // This `complete` might fire *before* the actual file upload is done by the SDK
            // because `from(blockBlobClient.uploadBrowserData(...))` completes when the promise
            // for starting the upload resolves, not necessarily when all bytes are sent.
            // Rely on `this.uploadProgressSubscription` for true upload completion.
          }
        });

    } catch (err: any) {
      this.notificationService.showError('Failed to initiate video upload process due to client-side error.');
      console.error('Upload initiation error (try-catch block in onSubmit):', err);
      this.resetFormOnUploadError();
    }
  }

  private resetFormOnUploadError(): void {
    this.isUploadingFile = false;
    this.isFileUploaded = false;
    this.fileUploadProgress = 0; // Reset to 0
    this.uploadedVideoUrl = null;
    this.isSubmittingMetadata = false; // Important: reset if metadata submission also failed
    // Consider resetting the file selector input if desired
    // this.fileSelectorComponent.clearFile(); // If you have a @ViewChild for it
  }

  private submitMetadata(): void {
    if (!this.uploadedVideoUrl) {
      this.notificationService.showError('Video URL is missing. Cannot submit metadata.');
      this.isSubmittingMetadata = false;
      return;
    }
    if (this.currentUserId === null) {
      this.notificationService.showError('User ID is missing. Cannot submit metadata.');
      this.isSubmittingMetadata = false;
      return;
    }

    this.isSubmittingMetadata = true;
    this.notificationService.showInfo('Saving video details...');


    const videoMetadata: videoMetadataRequestDto = {
      videoName: this.uploadForm.get('name')?.value,
      videoDescription: this.uploadForm.get('description')?.value,
      categoryName: this.selectedCategory?.categoryName ?? undefined,
      videoTags: this.selectedTags
    };

    this.videoMetadataService.submitVideoMetadata(videoMetadata).pipe(
      finalize(() => {
        this.isSubmittingMetadata = false;
      })
    ).subscribe({
      next: (response: VideoMetadataDto) => {
        this.notificationService.showSuccess('Video metadata saved successfully!');
        this.resetFormAndState(); // Clear form after successful submission
        this.router.navigate([`/video/${response.videoId}`]);
      },
      error: (err: any) => {
        console.error('Failed to save video metadata:', err);
        this.notificationService.showError('Failed to save video metadata.');
      }
    });
  }

  private resetFormAndState(): void {
    this.uploadForm.reset();
    this.selectedFile = null;
    this.suggestedTags = [];
    this.selectedTags = [];
    this.selectedCategory = null;
    this.isFileUploaded = false;
    this.fileUploadProgress = 0;
    this.uploadedVideoUrl = null;
    this.isGeneratingTags = false;
    this.isUploadingFile = false;
    this.isSubmittingMetadata = false;
    // If you have a reference to FileSelectorComponent (e.g., via @ViewChild), you can clear its input
    // this.fileSelectorComponent.clearFile();
  }

  get f() {
    return this.uploadForm.controls;
  }
}
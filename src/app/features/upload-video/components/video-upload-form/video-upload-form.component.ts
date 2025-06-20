
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

import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { CategoryDto } from '../../../../shared/models/category';
import { TagDto } from '../../../../shared/models/tag';
import { VideoMetadataDto } from '../../../../shared/models/video';
import { User } from '../../../auth/models/user.model';
import { AuthFacade } from '../../../auth/services/auth.facade';


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
  fileUploadProgress: number | null = null;
  isSubmittingMetadata: boolean = false;

  private uploadedVideoUrl: string | null = null;
  private currentUserId: number | null = null;
  private authSubscription!: Subscription;

  constructor(
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
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onFileSelected(file: File | null): void {
    this.selectedFile = file;
    this.isFileUploaded = false;
    this.fileUploadProgress = null;
    this.uploadedVideoUrl = null;
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
        this.notificationService.showError('Failed to generate suggested tags.'); // Show error to user
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
    }
    if (this.selectedTags.length === 0) {
      this.notificationService.showWarning('Please add at least one tag for the video.');
    }
    if (this.currentUserId === null) {
      this.notificationService.showError('User not logged in. Cannot upload video.');
      return;
    }

    this.isUploadingFile = true;
    this.fileUploadProgress = 0;

    try {
      this.notificationService.showInfo('Starting video upload...');

      // --- Use the new SAS token based upload method ---
      this.blobStorageService.uploadFileWithSas(this.selectedFile)
        .pipe(
          finalize(() => {
            this.isUploadingFile = false; // Reset loading state regardless of success/error
          })
        )
        .subscribe({
          next: (event: HttpEvent<any>) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.fileUploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
            } else if (event.type === HttpEventType.Response) {
              // On successful response from Azure Blob Storage (via PUT)
              // The `event.url` contains the full SAS URI that was used for the upload.
              // We need to extract the base URL of the uploaded blob from it.
              const sasUri = event.url;
              if (sasUri) {
                // Parse the URI to remove the SAS query parameters.
                // The base blob URL is the part before the '?'
                this.uploadedVideoUrl = sasUri.split('?')[0];
                this.notificationService.showSuccess('Video file uploaded successfully!');
                this.isFileUploaded = true;

                // Proceed to submit metadata after successful file upload
                this.submitMetadata();
              } else {
                this.notificationService.showError('Upload successful, but video URL could not be determined.');
                console.error('SAS URI was unexpectedly null or empty in HttpEventType.Response');
                this.resetFormOnUploadError(); // Reset form if URL is not determined
              }
            }
          },
          error: (err: any) => {
            // Error handling from blobStorageService.uploadFileWithSas already shows notification
            console.error('Video file upload failed (via SAS):', err);
            this.resetFormOnUploadError();
          }
        });

    } catch (err: any) {
      this.notificationService.showError('Failed to initiate video upload process.');
      console.error('Upload initiation error (try-catch block):', err);
      this.resetFormOnUploadError();
    }
  }

  private resetFormOnUploadError(): void {
    this.isUploadingFile = false;
    this.isFileUploaded = false;
    this.fileUploadProgress = null;
    this.uploadedVideoUrl = null;
  }

  private submitMetadata(): void {
    if (!this.uploadedVideoUrl) {
      this.notificationService.showError('Video URL is missing. Cannot submit metadata.');
      this.isSubmittingMetadata = false; // Ensure loading state is reset
      return;
    }
    if (this.currentUserId === null) {
      this.notificationService.showError('User ID is missing. Cannot submit metadata.');
      this.isSubmittingMetadata = false; // Ensure loading state is reset
      return;
    }

    this.isSubmittingMetadata = true;
    this.notificationService.showInfo('Saving video details...');

    const videoTags: TagDto[] = this.selectedTags.map(tagName => ({ tagName: tagName }));

    const videoMetadata: VideoMetadataDto = {
      videoName: this.uploadForm.get('name')?.value,
      videoDescription: this.uploadForm.get('description')?.value,
      videoUrl: this.uploadedVideoUrl,
      userId: this.currentUserId,
      category: this.selectedCategory ?? undefined,
      videoTags: videoTags
    };

    this.videoMetadataService.submitVideoMetadata(videoMetadata).pipe(
      finalize(() => {
        this.isSubmittingMetadata = false;
        // Form reset and cleanup moved here, as it's the final step after metadata submission
        this.resetFormAndState();
      })
    ).subscribe({
      next: (response: VideoMetadataDto) => {
        this.notificationService.showSuccess('Video metadata saved successfully! Video is now processing.');
      },
      error: (err: any) => {
        console.error('Failed to save video metadata:', err);
        this.notificationService.showError('Failed to save video metadata.'); // Show error to user
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
    this.fileUploadProgress = null;
    this.uploadedVideoUrl = null;
    this.isGeneratingTags = false; // Reset all loading/state flags
    this.isUploadingFile = false;
    this.isSubmittingMetadata = false;
  }

  get f() {
    return this.uploadForm.controls;
  }
}

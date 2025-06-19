import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BlobStorageService } from '../../services/blob-storage.service';
import { TagsGenerationService } from '../../services/tags-generation.service';
import { VideoMetadataService } from '../../services/video-metadata.service';

import { finalize } from 'rxjs/operators';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Required for ngIf, ngFor etc.
// Import standalone components used in its template
import { FileSelectorComponent } from '../file-selector/file-selector.component';
import { TagInputComponent } from '../tag-input/tag-input.component';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';

import { Subscription } from 'rxjs'; // Import Subscription
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
  styleUrls: ['./video-upload-form.component.scss'] // Assuming file exists
})
export class VideoUploadFormComponent implements OnInit, OnDestroy { // Implement OnDestroy
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  suggestedTags: string[] = [];
  selectedTags: string[] = []; // Still array of strings from TagInputComponent
  selectedCategory: CategoryDto | null = null;

  isGeneratingTags: boolean = false;
  isUploadingFile: boolean = false;
  isFileUploaded: boolean = false;
  fileUploadProgress: number | null = null;
  isSubmittingMetadata: boolean = false;

  private uploadedVideoUrl: string | null = null; // Renamed to avoid confusion
  private currentUserId: number | null = null; // FIX: Changed to number or null
  private authSubscription!: Subscription; // To manage subscription

  constructor(
    private fb: FormBuilder,
    private blobStorageService: BlobStorageService,
    private tagsGenerationService: TagsGenerationService,
    private videoMetadataService: VideoMetadataService,
    private notificationService: NotificationService,
    private authFacade: AuthFacade // Inject AuthFacade
  ) { }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });

    // Subscribe to currentUser$ to get the userId
    this.authSubscription = this.authFacade.currentUser$.subscribe(
      (user: User | null) => {
        if (user && user.userId) { // Ensure user and userId exist
          this.currentUserId = user.userId;
        } else {
          this.currentUserId = null; // User not logged in or userId not available
          // Optionally, redirect to login page if userId is crucial for this page
          // this.router.navigate(['/login']);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    }
  }

  onFileSelected(file: File | null): void {
    this.selectedFile = file;
    this.isFileUploaded = false;
    this.fileUploadProgress = null;
    this.uploadedVideoUrl = null;
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
      next: (tags: string[]) => { // Explicitly type 'tags'
        this.suggestedTags = tags;
        this.notificationService.showSuccess('AI suggested tags generated!');
      },
      error: (err: any) => { // Explicitly type 'err'
        console.error('Failed to generate suggested tags:', err);
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
    if (this.currentUserId === null) { // Ensure userId is available before proceeding
        this.notificationService.showError('User not logged in. Cannot upload video.');
        return;
    }

    this.isUploadingFile = true;
    this.fileUploadProgress = 0;

    try {
      this.notificationService.showInfo('Starting video upload...');
      // Direct file upload without SAS token now
      this.blobStorageService.uploadFile(this.selectedFile) // Call the new uploadFile method
        .pipe(finalize(() => this.isUploadingFile = false))
        .subscribe({
          next: (event: HttpEvent<any>) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.fileUploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
            } else if (event.type === HttpEventType.Response) {
              // The OpenAPI /upload endpoint returns 200 OK without a body.
              // Assuming the backend provides the URL of the uploaded blob in the response headers or body
              // For now, setting a dummy URL as it's not explicitly in OpenAPI response.
              this.uploadedVideoUrl = `https://yourblobstorage.com/videos/${this.selectedFile?.name}`; // FIX: Dummy URL
              this.notificationService.showSuccess('Video file uploaded successfully!');
              this.isFileUploaded = true;

              // Step 3: Submit video metadata
              this.submitMetadata();
            }
          },
          error: (err: any) => {
            this.notificationService.showError('Video file upload failed.');
            console.error('Direct upload error:', err);
            this.isUploadingFile = false;
            this.isFileUploaded = false;
            this.fileUploadProgress = null;
          }
        });

    } catch (err: any) {
      this.notificationService.showError('Failed to prepare for video upload.');
      console.error('Upload initiation error:', err);
      this.isUploadingFile = false;
      this.isFileUploaded = false;
      this.fileUploadProgress = null;
    }
  }

  private submitMetadata(): void {
    if (!this.uploadedVideoUrl) {
      this.notificationService.showError('Video URL is missing. Cannot submit metadata.');
      return;
    }
    if (this.currentUserId === null) {
      this.notificationService.showError('User ID is missing. Cannot submit metadata.');
      return;
    }

    this.isSubmittingMetadata = true;
    this.notificationService.showInfo('Saving video details...');

    // Transform selectedTags (string[]) to TagDto[] as expected by VideoMetadataDto/backend
    const videoTags: TagDto[] = this.selectedTags.map(tagName => ({ tagName: tagName }));

    const videoMetadata: VideoMetadataDto = {
      videoName: this.uploadForm.get('name')?.value,
      videoDescription: this.uploadForm.get('description')?.value,
      videoUrl: this.uploadedVideoUrl,
      userId: this.currentUserId, // Use the dynamically obtained userId
      categoryId: this.selectedCategory?.categoryId, // Use categoryId
      videoTags: videoTags // Pass array of TagDto objects
      // videoId, videoUploadDate, videoUpdatedDate are handled by backend on POST
    };

    this.videoMetadataService.submitVideoMetadata(videoMetadata).pipe(
      finalize(() => {
        this.isSubmittingMetadata = false;
        this.uploadForm.reset();
        this.selectedFile = null;
        this.suggestedTags = [];
        this.selectedTags = [];
        this.selectedCategory = null;
        this.isFileUploaded = false;
        this.fileUploadProgress = null;
        this.uploadedVideoUrl = null;
      })
    ).subscribe({
      next: (response: VideoMetadataDto) => {
        this.notificationService.showSuccess('Video metadata saved successfully! Video is now processing.');
        // Optionally navigate to a success page or video detail page
        // this.router.navigate(['/video', response.videoId]); // Use videoId
      },
      error: (err: any) => {
        console.error('Failed to save video metadata:', err);
      }
    });
  }

  get f() {
    return this.uploadForm.controls;
  }
}
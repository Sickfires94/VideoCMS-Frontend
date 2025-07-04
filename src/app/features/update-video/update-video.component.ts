// src/app/features/update-video/update-video.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Ensure RouterModule is imported
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { CategoryDto } from '../../shared/models/category';
import { VideoMetadataDto } from '../../shared/models/videoMetadata';
import { CategorySelectorComponent } from '../upload-video/components/category-selector/category-selector.component';
import { TagInputComponent } from '../upload-video/components/tag-input/tag-input.component';
import { UploadVideoForm } from '../upload-video/models/upload';
import { TagsGenerationService } from '../upload-video/services/tags-generation.service';
import { VideoDetailService } from '../video-details/services/video-detail.service';
import { VideoUpdateService } from './services/video-update.service';
import { VideoMetadataResponseDto } from '../../shared/models/ResponseDtos/videoMetadata';


@Component({
  selector: 'app-update-video',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // Needed for routerLink in template and router.navigate
    // --- FIX: Removed FileSelectorComponent from imports array ---
    TagInputComponent,
    CategorySelectorComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './update-video.component.html',
  styleUrls: ['./update-video.component.scss']
})
export class UpdateVideoComponent implements OnInit {
  updateVideoForm!: FormGroup<{
    videoFile: FormControl<File | null>; // Kept for consistency with UploadVideoForm, but will be null
    name: FormControl<string>;
    description: FormControl<string>;
    suggestedTags: FormControl<string[]>;
    selectedTags: FormControl<string[]>;
    selectedCategoryName: FormControl<string | null>;
  }>;

  videoId: number | null = null;
  originalVideoMetadata: VideoMetadataDto | null = null;

  suggestedTags: string[] = [];
  isLoadingSuggestedTags: boolean = false;
  isUpdatingVideo: boolean = false;
  isLoadingVideo: boolean = true;
  // InitialTags: string[] = []

  constructor(
    private route: ActivatedRoute,
    // --- FIX: Changed 'private router' to 'public router' ---
    public router: Router, // <--- This makes 'router' accessible in the template
    private videoDetailService: VideoDetailService,
    private videoUpdateService: VideoUpdateService,
    private tagsGenerationService: TagsGenerationService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.subscribe(params => {
      this.videoId = Number(params.get('id'));
      if (this.videoId) {
        this.loadVideoForUpdate(this.videoId);
      } else {
        this.notificationService.showError('Video ID is missing for update operation. Redirecting...');
        this.router.navigate(['/search']);
      }
    });

    this.updateVideoForm.controls.name.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.generateSuggestedTags());

    this.updateVideoForm.controls.description.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => this.generateSuggestedTags());
  }

  initializeForm(): void {
    this.updateVideoForm = new FormGroup({
      videoFile: new FormControl<File | null>(null),
      name: new FormControl('', { nonNullable: true, validators: Validators.required }),
      description: new FormControl('', { nonNullable: true, validators: Validators.required }),
      suggestedTags: new FormControl<string[]>([], { nonNullable: true }),
      selectedTags: new FormControl<string[]>([], { nonNullable: true }),
      selectedCategoryName: new FormControl<string | null>(null),
    });
  }

  loadVideoForUpdate(videoId: number): void {
    this.isLoadingVideo = true;
    this.videoDetailService.getVideoById(videoId).pipe(
      finalize(() => this.isLoadingVideo = false)
    ).subscribe({
      next: (videoData: VideoMetadataResponseDto) => {
        this.originalVideoMetadata = {
          videoId: videoData.videoId,
          videoName: videoData.videoName,
          videoDescription: videoData.videoDescription,
          videoUrl: videoData.videoUrl,
          videoUploadDate: videoData.videoUploadDate,
          categoryName: videoData.categoryName,
          userName : videoData.userName
        };
        this.updateVideoForm.patchValue({
          name: videoData.videoName,
          description: videoData.videoDescription,
          selectedCategoryName: videoData.categoryName ?? null,
          selectedTags: videoData.videoTags
        });
        // this.InitialTags = videoData.videoTags ?? [];
        this.generateSuggestedTags();
      },
      error: (err) => {
        this.notificationService.showError('Failed to load video for update: ' + (err.message || 'Unknown error.'));
        console.error('Error loading video details for update:', err);
        this.router.navigate(['/search']);
      }
    });
  }

  onCategorySelected(category: CategoryDto | null): void {
    this.updateVideoForm.controls.selectedCategoryName.setValue(category?.categoryName ?? null);
  }

  onTagsChanged(tags: string[]): void {
    this.updateVideoForm.controls.selectedTags.setValue(tags);
  }

  generateSuggestedTags(): void {
    const name = this.updateVideoForm.controls.name.value;
    const description = this.updateVideoForm.controls.description.value;

    if (!name || !description) {
      this.suggestedTags = [];
      this.updateVideoForm.controls.suggestedTags.setValue([]);
      return;
    }

    this.isLoadingSuggestedTags = true;
    this.tagsGenerationService.generateTags(name, description).pipe(
      finalize(() => this.isLoadingSuggestedTags = false)
    ).subscribe({
      next: (tags) => {
        this.suggestedTags = tags;
        this.updateVideoForm.controls.suggestedTags.setValue(tags);
      },
      error: (err) => {
        console.error('Error generating suggested tags:', err);
      }
    });
  }

  onSubmit(): void {
    // Ensure all required data is available
    if (this.updateVideoForm.invalid || !this.videoId || !this.originalVideoMetadata) {
      this.notificationService.showError('Please fill in all required fields and ensure video data is loaded.');
      this.updateVideoForm.markAllAsTouched();
      return;
    }

    this.isUpdatingVideo = true;

    // this.updateVideoForm.controls.selectedTags.setValue(
    //   this.updateVideoForm.controls.selectedTags.value.filter(
    //     item => !this.InitialTags.includes(item) // <-- FIX IS HERE
    //   )
    // );

    const completeVideoDto: VideoMetadataDto = {
      ...this.originalVideoMetadata,
      videoId: this.originalVideoMetadata.videoId,
      videoName: this.updateVideoForm.controls.name.value,
      videoDescription: this.updateVideoForm.controls.description.value,
      categoryName: this.updateVideoForm.controls.selectedCategoryName.value || undefined,
      videoTags: this.updateVideoForm.controls.selectedTags.value,
    };

    // --- FIX: Pass the completeVideoDto (which now includes videoUrl) ---
    this.videoUpdateService.updateVideo(
      Number(this.videoId),
      completeVideoDto // Pass the complete, updated DTO
    ).pipe(
      finalize(() => this.isUpdatingVideo = false)
    ).subscribe({
      next: (updatedVideo: VideoMetadataDto) => {
        this.notificationService.showSuccess(`Video "${updatedVideo.videoName}" updated successfully!`);
        this.router.navigate(['/video', updatedVideo.videoId]);
      },
      error: (err) => {
        // this.notificationService.showError('Failed to update video. Please check console for details.');
        console.error('Error updating video:', err);
      }
    });
  }
}
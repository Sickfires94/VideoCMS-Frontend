// src/app/features/video-detail/video-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VideoDetailService } from './services/video-detail.service';
import { VideoDeleteService } from './services/video-delete.service'; // <--- NEW: Import VideoDeleteService
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { VideoMetadataDto } from '../../shared/models/video';
import { VideoPlayerComponent } from './components/video-player.component';
import { AuthFacade } from '../auth/services/auth.facade';
import { NotificationService } from '../../core/services/notification.service'; // <--- NEW: Import NotificationService

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [
    CommonModule,
    VideoPlayerComponent,
    LoadingSpinnerComponent,
    RouterModule
  ],
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.scss']
})
export class VideoDetailComponent implements OnInit, OnDestroy {
  video: VideoMetadataDto | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  currentUserName: string | null = null; // Stores the current logged-in user's ID (assuming string for GUID)

  isOwner: boolean = false; // Property to store ownership status
  isDeleting: boolean = false; // <--- NEW: Flag for delete operation in progress

  private _currentVideoId: number | null = null; // Internal string ID for video

  private destroy$ = new Subject<void>(); // Subject for managing subscriptions

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private videoDetailService: VideoDetailService,
    private videoDeleteService: VideoDeleteService, // <--- NEW: Inject VideoDeleteService
    private authService: AuthFacade,
    private notificationService: NotificationService // <--- NEW: Inject NotificationService
  ) { }

  ngOnInit(): void {
    // Subscribe to the current user's ID from the AuthService
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        // Assuming your AuthFacade now correctly provides a 'User' object with 'id: string'
        this.currentUserName = user?.userName ?? null; // Use user.id from the User model (which is string)
        this.updateOwnershipStatus();
      });

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const videoIdString = params.get('id');

        if (!videoIdString) {
          this.errorMessage = 'Video ID not provided in the URL.';
          this.isLoading = false;
          this.router.navigate(['/search']);
          return;
        }

        this._currentVideoId = Number(videoIdString); // Store as string
        this.loadVideoDetails(this._currentVideoId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadVideoDetails(videoId: number): void { // Changed videoId type to string
    this.isLoading = true;
    this.errorMessage = null;
    this.video = null;
    this.isOwner = false;

    // Assuming getVideoById now takes a string ID
    this.videoDetailService.getVideoById(videoId).pipe(
      finalize(() => this.isLoading = false),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (videoData: VideoMetadataDto) => {
        this.video = videoData;
        this.updateOwnershipStatus();
      },
      error: (err) => {
        this.errorMessage = err.message || 'An unexpected error occurred while loading video.';
        console.error('Error loading video details:', err);
      }
    });
  }

  /**
   * Determines if the currently logged-in user is the owner of the displayed video.
   * This is used to conditionally show the "Edit" and "Delete" buttons.
   */
  private updateOwnershipStatus(): void {
    // Ensure video.userId is also a string for direct comparison with currentUserId
    this.isOwner = !!this.video && !!this.currentUserName && this.video.userName === this.currentUserName;
  }

  /**
   * Handles the click event for the delete video button.
   * Prompts for confirmation and calls the delete service.
   */
  onDeleteVideo(): void {
    if (!this.video?.videoId) {
      this.notificationService.showError('Cannot delete: Video ID is missing.');
      return;
    }

    // Use a native browser confirmation dialog. For a better UX, consider Angular Material Dialog or similar.
    const confirmDelete = confirm(`Are you sure you want to delete the video "${this.video.videoName}"? This action cannot be undone.`);

    if (confirmDelete) {
      this.isDeleting = true; // Set deleting flag to disable button
      this.videoDeleteService.deleteVideo(this.video.videoId).pipe(
        finalize(() => this.isDeleting = false) // Reset flag regardless of success/failure
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Video "${this.video?.videoName}" successfully deleted.`);
          this.router.navigate(['/search']); // Redirect to a safe page (e.g., search results)
        },
        error: (err) => {
          // Notification service already shows error, just log for detail
          console.error('Error during video deletion:', err);
        }
      });
    }
  }

  // Helper getters for formatting (from previous steps)
  get formattedUploadDate(): string {
    if (this.video?.videoUploadDate) {
      return new Date(this.video.videoUploadDate).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    return 'N/A';
  }

    /**
   * Redirects to the video changelog page if the user is the owner.
   */
    viewChangelogs(): void {
      if (this.video && this.isOwner) {
        console.log(`Viewing logs for video Id: ${this.video.videoId}`)
        this.router.navigate(['/video-changelogs', this.video.videoId]);
      } else {
        this.notificationService.showWarning('You do not have permission to view changelogs for this video.');
      }
    }
  

  // get formattedDuration(): string {
  //   if (typeof this.video?.durationSeconds === 'number') {
  //     const totalSeconds = this.video.durationSeconds;
  //     const hours = Math.floor(totalSeconds / 3600);
  //     const minutes = Math.floor((totalSeconds % 3600) / 60);
  //     const seconds = Math.floor(totalSeconds % 60);

  //     const parts = [];
  //     if (hours > 0) parts.push(`${hours}h`);
  //     if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  //     parts.push(`${seconds}s`);

  //     return parts.join(' ');
  //   }
  //   return 'N/A';
  // }
}
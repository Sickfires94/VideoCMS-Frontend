// src/app/features/video-changelogs/components/video-changelogs-page.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, Subject, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { LogCardComponent } from './log-card/log-card.component'; // <<< NEW: Import LogCardComponent
import { NotificationService } from '../../../core/services/notification.service';
import { VideoMetadataChangeLog } from '../../../shared/models/video-metadata-changelog';
import { VideoMetadataService } from '../../upload-video/services/video-metadata.service';


@Component({
  selector: 'app-video-changelogs-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LogCardComponent // <<< NEW: Add LogCardComponent to imports
  ],
  templateUrl: './video-changelogs-page.component.html',
  styleUrls: ['./video-changelogs-page.component.scss']
})
export class VideoChangelogsPageComponent implements OnInit, OnDestroy {
  videoId: number | null = null;
  changelogs: VideoMetadataChangeLog[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoMetadataService: VideoMetadataService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (isNaN(id) || id <= 0) {
          this.errorMessage = 'Invalid video ID provided.';
          this.notificationService.showError(this.errorMessage);
          this.isLoading = false;
          return of([]);
        }
        this.videoId = id;
        this.isLoading = true;
        this.errorMessage = null;
        
        return this.videoMetadataService.getVideoChangelogs(id).pipe(
          catchError(error => {
            console.error('Error fetching video changelogs:', error);
            if (error.status === 403) {
              this.errorMessage = 'You do not have permission to view changelogs for this video.';
            } else if (error.status === 404) {
              this.errorMessage = 'Video changelogs not found for this video.';
            } else {
              this.errorMessage = error.error?.message || 'Failed to load video changelogs.';
            }
            // this.notificationService.showError(this.errorMessage);
            this.isLoading = false;
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(logs => {
      this.changelogs = logs;
      this.isLoading = false;
      if (this.changelogs.length === 0 && !this.errorMessage) {
        this.notificationService.showInfo('No changelogs found for this video.');
      }
    });
  }

  goBackToVideoDetail(): void {
    if (this.videoId) {
      this.router.navigate(['/video', this.videoId]);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
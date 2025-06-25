import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
})
export class VideoPlayerComponent implements OnChanges {
  @Input() videoUrl: string | null = null;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  isLoading: boolean = true;
  isReadyToPlay: boolean = false;
  videoDuration: string = '00:00';
  private durationCheckInterval: any; // To hold the interval reference

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoUrl']) {
      this.resetPlayerState(); // Reset everything when URL changes

      if (this.videoUrl && this.videoElement && this.videoElement.nativeElement) {
        if (this.videoElement.nativeElement.src !== this.videoUrl) {
          this.videoElement.nativeElement.src = this.videoUrl;
        }
        this.videoElement.nativeElement.load();
        console.log('VideoPlayer: Loading new video from:', this.videoUrl);

        // Start a fallback check if loadedmetadata doesn't give duration immediately
        // This is a safety net for problematic files or slow metadata parsing
        this.startDurationFallbackCheck();

      } else {
        this.isLoading = false;
        this.videoDuration = '00:00';
        console.log('VideoPlayer: videoUrl is null, player reset.');
      }
    }
  }

  ngOnDestroy(): void {
    this.clearDurationFallbackCheck();
  }

  private resetPlayerState(): void {
    this.isReadyToPlay = false;
    this.isLoading = true;
    this.videoDuration = '00:00';
    this.clearDurationFallbackCheck(); // Clear any existing interval
    if (this.videoElement && this.videoElement.nativeElement) {
      this.videoElement.nativeElement.pause(); // Pause any currently playing video
      this.videoElement.nativeElement.currentTime = 0; // Reset playback position
    }
  }

  private startDurationFallbackCheck(): void {
    this.clearDurationFallbackCheck(); // Ensure no multiple intervals are running
    let attempts = 0;
    const maxAttempts = 10; // Try a few times
    const intervalTime = 500; // Check every 500ms

    this.durationCheckInterval = setInterval(() => {
      if (this.videoElement && this.videoElement.nativeElement) {
        const video = this.videoElement.nativeElement;
        if (video.readyState > 0 && video.duration && isFinite(video.duration)) {
          this.videoDuration = this.formatDuration(video.duration);
          this.isLoading = false;
          console.log('VideoPlayer: Duration confirmed by fallback check:', this.videoDuration);
          this.clearDurationFallbackCheck(); // Duration found, stop checking
        } else if (attempts >= maxAttempts) {
          console.warn('VideoPlayer: Could not determine finite duration after multiple attempts.');
          // Optionally display a "duration unavailable" message
          if (video.duration === Infinity) {
             this.videoDuration = 'Live Stream'; // Or a more appropriate message
          } else {
             this.videoDuration = 'N/A';
          }
          this.isLoading = false;
          this.clearDurationFallbackCheck();
        }
      }
      attempts++;
    }, intervalTime);
  }

  private clearDurationFallbackCheck(): void {
    if (this.durationCheckInterval) {
      clearInterval(this.durationCheckInterval);
      this.durationCheckInterval = null;
    }
  }


  // --- Media Event Handlers ---

  @HostListener('loadedmetadata', ['$event'])
  onLoadedMetadata(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video.duration && isFinite(video.duration)) {
      this.videoDuration = this.formatDuration(video.duration);
      this.isLoading = false;
      this.clearDurationFallbackCheck(); // Duration found, stop fallback check
      console.log('VideoPlayer: Metadata loaded. Duration:', this.videoDuration);
    } else {
      console.warn('VideoPlayer: loadedmetadata fired, but duration is not valid or is Infinity. Fallback check active.');
      // Keep isLoading true and let the fallback check continue if duration is not finite
    }
  }

  @HostListener('canplay', ['$event'])
  onCanPlay(event: Event): void {
    this.isReadyToPlay = true;
    this.isLoading = false; // Even if duration is Infinity, it can play
    console.log('VideoPlayer: Video is ready to play (canplay event).');
  }

  @HostListener('waiting', ['$event'])
  onWaiting(event: Event): void {
    console.log('VideoPlayer: Video is waiting for data (buffering).');
    this.isLoading = true;
  }

  @HostListener('playing', ['$event']) // Use 'playing' instead of 'play' for when it's actually playing after buffering
  onPlaying(event: Event): void {
    console.log('VideoPlayer: Video playing.');
    this.isLoading = false;
  }

  @HostListener('pause', ['$event'])
  onPause(event: Event): void {
    console.log('VideoPlayer: Video paused.');
    this.isLoading = false;
  }

  @HostListener('ended', ['$event'])
  onEnded(event: Event): void {
    console.log('VideoPlayer: Video ended.');
    this.isLoading = false;
    this.isReadyToPlay = false;
    this.videoDuration = '00:00'; // Reset duration display for next play
  }

  @HostListener('error', ['$event'])
  onError(event: Event): void {
    console.error('VideoPlayer: Video playback error:', event);
    this.isLoading = false;
    this.isReadyToPlay = false;
    this.videoDuration = 'Error';
    this.clearDurationFallbackCheck(); // Stop check on error
  }

  private formatDuration(seconds: number): string {
    if (!isFinite(seconds)) return 'N/A'; // Handle Infinity or NaN if somehow passed
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const pad = (num: number) => num < 10 ? '0' + num : num.toString();
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  }
}
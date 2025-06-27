// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard'; // Ensure this path is correct and AuthGuard is provided
import { VideoChangelogsPageComponent } from './features/video-changelogs/components/video-changelogs-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },

  // Public routes (auth feature)
  {
    path: '', // Or a specific path like 'auth' if you prefer
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Protected routes
  // NEW: Video Upload Feature Route (Lazy-loaded with AuthGuard)
  {
    path: 'upload',
    loadChildren: () => import('./features/upload-video/upload-video.module').then(m => m.UploadVideoModule),
    canActivate: [AuthGuard] // Protect the upload route
  },

  {
    path: 'search', // <-- NEW ROUTE FOR VIDEO SEARCHING
    loadChildren: () => import('./features/video-searching/video-searching.module').then(m => m.VideoSearchingModule),
  },
  
  {
    path: 'video', // Parent path for video details
    loadChildren: () => import('./features/video-details/video-detail.module').then(m => m.VideoDetailModule)
  },
  {
    path: 'update-video', // Route for updating a video
    loadChildren: () => import('./features/update-video/update-video.module').then(m => m.UpdateVideoModule),
    canActivate: [AuthGuard] // Protect the upload route
  },

  {
    path: 'video-changelogs/:id', // New route for changelogs page
    component: VideoChangelogsPageComponent,
    canActivate: [AuthGuard] // Protect changelogs route as well
  },

  { path: '**', redirectTo: '/search' }
];
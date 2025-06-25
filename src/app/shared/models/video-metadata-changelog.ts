// src/app/shared/models/video-metadata-changelog.model.ts
export interface VideoMetadataChangeLog {
    videoId: number;
    changeTime: string; // Changed from 'changeDate' to 'changeTime'
    changeType: string;
  
    // Specific properties for video name changes
    previousVideoName: string | null;
    updatedVideoName: string | null;
  
    // Specific properties for video description changes
    previousVideoDescription: string | null;
    updatedVideoDescription: string | null;
  
    // Specific properties for video URL changes
    previousVideoUrl: string | null;
    updatedVideoUrl: string | null;
  
    // Specific properties for category ID changes
    previousCategoryId: number | null; // Assuming category ID is number
    updatedCategoryId: number | null; // Assuming category ID is number
  
    updatedByUserName: string | null;
  }
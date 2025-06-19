import { TagDto } from "./tag";

export interface VideoMetadataDto {
    videoId?: number; // Renamed from 'id', type 'number' (int32), optional for new videos
    videoName: string; // Renamed from 'name'
    videoDescription?: string; // Renamed from 'description', nullable
    videoUrl: string; // Matches
    videoTags?: TagDto[]; // IMPORTANT: Now an array of TagDto objects, not string[]
    categoryId?: number; // Renamed from 'categoryId' to match backend 'categoryId' type 'number'
    // category is a nested object, omit or define if full object needed
    userId: number; // Renamed from 'userId' to match backend 'userId' type 'number'
    // user is a nested object, omit or define if full object needed
    videoUploadDate?: string; // Added, type 'string' (date), optional for new videos
    videoUpdatedDate?: string; // Added, type 'string' (date), optional for new videos
  }
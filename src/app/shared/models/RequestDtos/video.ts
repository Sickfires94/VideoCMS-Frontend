


export interface VideoMetadataUpdateDto {
    videoId?: number; // Renamed from 'id', type 'number' (int32), optional for new videos
    videoName: string; // Renamed from 'name'
    videoDescription?: string; // Renamed from 'description', nullable
    videoTags?: string[]; // IMPORTANT: Now an array of TagDto objects, not string[]
    categoryId?: number; // Renamed from 'categoryId' to match backend 'categoryId' type 'number'
  }
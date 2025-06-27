
export interface VideoMetadataDto {
  videoId: number; // Renamed from 'id', type 'number' (int32), optional for new videos
  videoName: string; // Renamed from 'name'
  videoDescription?: string; // Renamed from 'description', nullable
  videoUrl: string; // Matches
  videoTags?: string[]; // IMPORTANT: Now an array of TagDto objects, not string[]
  categoryName?: string; // Renamed from 'categoryId' to match backend 'categoryId' type 'number'
  userName: string;
  videoUploadDate?: string; // Added, type 'string' (date), optional for new videos

  playableVideoUrl? : string;
}

export interface videoMetadataRequestDto {
  videoId?: number;
  videoName: string;
  videoDescription?: string;
  videoTags: string[] | [];
  categoryName? : string;

}
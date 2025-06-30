
export interface VideoMetadataResponseDto {
    videoId: number;
    videoName: string;
    videoDescription?: string;
    videoUrl: string; 
    videoTags?: string[]; 
    categoryName?: string;
    userName: string;
    videoUploadDate?: string;
  }
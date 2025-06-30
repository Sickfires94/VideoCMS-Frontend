import { VideoMetadataResponseDto } from "./ResponseDtos/videoMetadata";

export interface VideoMetadataDto extends VideoMetadataResponseDto{

  // Added to store playable url in Dto for easy access
  playableVideoUrl? : string;
}


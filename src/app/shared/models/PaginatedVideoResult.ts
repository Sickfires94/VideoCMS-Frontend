import { VideoMetadataSearchDto } from "../../features/video-searching/models/videoMetadataSearchDto";

  // If your backend returns paginated results, you might have a structure like this:
  export interface PaginatedVideoResult {
    items: VideoMetadataSearchDto[];
  }
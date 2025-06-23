import { CategoryDto } from "../../../shared/models/category";

export interface UploadVideoForm {
  videoId? : number;
    videoFile: File | null;
    name: string;
    description: string;
    suggestedTags: string[]; // Still strings as AI suggests names
    selectedTags: string[]; // Still strings as user inputs names
    selectedCategory: CategoryDto | null;
  }
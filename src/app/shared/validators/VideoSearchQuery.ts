// --- NEW INTERFACES FOR VIDEO SEARCHING ---
export interface VideoSearchQuery {
    searchTerm?: string | null;
    categoryId?: string | null;
    tagIds?: string[] | null;
    sortBy?: 'uploadDate' | 'name' | 'views'; // Example sort fields
    sortDirection?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
  }
  

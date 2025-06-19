export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
    errors?: string[];
    statusCode?: number;
  }

  export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageSize: number;
    pageNumber: number;
  }

 
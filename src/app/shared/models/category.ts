export interface CategoryDto {
    categoryName: string;
    parentCategoryName?: string | null;
    children? : CategoryDto[]
  }

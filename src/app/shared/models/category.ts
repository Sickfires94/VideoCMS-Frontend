export interface CategoryDto {
    categoryId: number;
    categoryName: string;
    categoryParentId: number | null;
    children: CategoryDto[]
    categoryParent?: CategoryDto | null
  }
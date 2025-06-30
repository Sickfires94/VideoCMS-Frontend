interface CategoryTreeItemDto {
    categoryId: number;
    categoryName: string;
    children?: CategoryTreeItemDto[];
}

export interface CategoryTreeResponseDto {
    categories: CategoryTreeItemDto[];
}
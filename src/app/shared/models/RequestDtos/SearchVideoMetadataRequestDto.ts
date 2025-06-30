export interface videoMetadataSearchRequestDto {
    searchTerm?: string;
    categoryId: number;

    pageNumber: number;
    pageSize: number;
}
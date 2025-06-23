export interface VideoMetadataSearchDto {
    videoId: number,
    videoName: string,
    videoDescription: string,
    videoUpdatedDate: Date,
    videoUploadDate: Date,
    videoUrl: string,
    categoryName: string,
    videoTagNames: string[],
    userName: string,
}
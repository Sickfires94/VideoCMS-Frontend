export interface VideoMetadataSearchDto {
    videoId: number,
    videoName: string,
    videoDescription: string,
    videoUpdatedDate: Date,
    videoUploadedDate: Date,
    videoUrl: string,
    categoryName: string,
    videoTagNames: string[],
    username: string,
}
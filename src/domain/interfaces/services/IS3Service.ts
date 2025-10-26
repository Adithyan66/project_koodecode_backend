

export interface IS3Service {
    generatePresignedUrl(key: string, contentType: string): Promise<string>;
    deleteObject(key: string): Promise<void>;
    getPublicUrl(key: string): string;
    uploadFromUrl(imageUrl: string, s3Key: string, contentType?: string): Promise<string>;
}

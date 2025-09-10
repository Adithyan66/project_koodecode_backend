

export interface IImageUploadService {
  generateProfileImageUploadUrl(userId: string, fileExtension: string): Promise<{
    uploadUrl: string;
    imageKey: string;
    publicUrl: string;
  }>;
  deleteProfileImage(imageKey: string): Promise<void>;
}

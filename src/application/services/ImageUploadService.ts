

import { IS3Service } from '../interfaces/IS3Service';
import { IImageUploadService } from '../interfaces/IImageUploadService';

export class ImageUploadService implements IImageUploadService {
  constructor(private s3Service: IS3Service) {}

  async generateProfileImageUploadUrl(userId: string, fileExtension: string): Promise<{
    uploadUrl: string;
    imageKey: string;
    publicUrl: string;
  }> {
    const imageKey = `profile-images/${userId}/${Date.now()}.${fileExtension}`;
    const contentType = this.getContentType(fileExtension);
    
    const uploadUrl = await this.s3Service.generatePresignedUrl(imageKey, contentType);
    const publicUrl = this.s3Service.getPublicUrl(imageKey);

    return {
      uploadUrl,
      imageKey,
      publicUrl
    };
  }

  async deleteProfileImage(imageKey: string): Promise<void> {
    await this.s3Service.deleteObject(imageKey);
  }

  private getContentType(extension: string): string {
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp'
    };
    return contentTypes[extension.toLowerCase()] || 'image/jpeg';
  }
}

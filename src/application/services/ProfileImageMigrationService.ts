import { injectable, inject } from "tsyringe";
import { IS3Service } from "../interfaces/IS3Service";
import { IProfileImageMigrationService } from "../interfaces/IProfileImageMigrationService";



@injectable()
export class ProfileImageMigrationService implements IProfileImageMigrationService {
  constructor(
    @inject('IS3Service') private s3Service: IS3Service
  ) {}

  async migrateOAuthProfileImage(profileImageUrl: string, userId: string): Promise<string> {
    if (!profileImageUrl) {
      return '';
    }
    
    try {
      const fileExtension = this.getFileExtension(profileImageUrl);
      const s3Key = `profile-images/${userId}/${Date.now()}.${fileExtension}`;
      
      await this.s3Service.uploadFromUrl(profileImageUrl, s3Key);
      return s3Key;
    } catch (error) {
      console.error('Failed to migrate profile image:', error);
      return ''; // Return empty string if migration fails
    }
  }

  private getFileExtension(url: string): string {
    // Extract file extension from URL
    const match = url.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    return match ? match[1].toLowerCase() : 'jpg';
  }
}

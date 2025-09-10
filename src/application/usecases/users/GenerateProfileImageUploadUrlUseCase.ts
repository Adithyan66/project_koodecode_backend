

import { IImageUploadService } from '../../interfaces/IImageUploadService';
import { GenerateUploadUrlDto } from '../../dto/users/GenerateUploadUrlDto';
import { UploadUrlResponseDto } from '../../dto/users/UploadUrlResponseDto';

export class GenerateProfileImageUploadUrlUseCase {
  constructor(private imageUploadService: IImageUploadService) {}

  async execute(userId: string, dto: GenerateUploadUrlDto): Promise<UploadUrlResponseDto> {
    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExtensions.includes(dto.fileExtension.toLowerCase())) {
      throw new Error('Invalid file extension. Allowed: jpg, jpeg, png, webp');
    }

    return await this.imageUploadService.generateProfileImageUploadUrl(userId, dto.fileExtension);
  }
}

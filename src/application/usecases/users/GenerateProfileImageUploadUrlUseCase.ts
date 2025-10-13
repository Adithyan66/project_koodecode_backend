

import { IImageUploadService } from '../../interfaces/IImageUploadService';
import { GenerateUploadUrlDto } from '../../dto/users/GenerateUploadUrlDto';
import { UploadUrlResponseDto } from '../../dto/users/UploadUrlResponseDto';
import { IGenerateProfileImageUploadUrlUseCase } from '../../interfaces/IProfileUseCase';
import { inject, injectable } from 'tsyringe';


@injectable()
export class GenerateProfileImageUploadUrlUseCase implements IGenerateProfileImageUploadUrlUseCase {

  constructor(
    @inject('IImageUploadService') private imageUploadService: IImageUploadService
  ) { }

  async execute(userId: string, dto: GenerateUploadUrlDto): Promise<UploadUrlResponseDto> {

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExtensions.includes(dto.fileExtension.toLowerCase())) {
      throw new Error('Invalid file extension. Allowed: jpg, jpeg, png, webp');
    }

    return await this.imageUploadService.generateProfileImageUploadUrl(userId, dto.fileExtension);
  }
}

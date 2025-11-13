



import { IImageUploadService } from '../../interfaces/IImageUploadService';
import { GenerateUploadUrlDto } from '../../dto/users/GenerateUploadUrlDto';
import { UploadUrlResponseDto } from '../../dto/users/UploadUrlResponseDto';
import { IGenerateProfileImageUploadUrlUseCase } from '../../interfaces/IProfileUseCase';
import { inject, injectable } from 'tsyringe';


@injectable()
export class GenerateImageUploadUrlUseCase {

    constructor(
        @inject('IImageUploadService') private imageUploadService: IImageUploadService
    ) { }

    async execute(type: string, userId: string, dto: GenerateUploadUrlDto): Promise<UploadUrlResponseDto> {
        console.log('GenerateImageUploadUrlUseCase.execute called with:', { type, userId, dto });

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        if (!allowedExtensions.includes(dto.fileExtension.toLowerCase())) {
            throw new Error('Invalid file extension. Allowed: jpg, jpeg, png, webp');
        }

        const allowedTypes = ['profile-images', 'contest-thumbnail', 'room-thumbnail','badge-icons', 'notification-icon'];

        if (!allowedTypes.includes(type)) {
            throw new Error(`Invalid image type. Allowed: ${allowedTypes.join(', ')}`);
        }

        console.log('Calling imageUploadService.generateUploadUrl with:', { type, fileExtension: dto.fileExtension, userId });
        return await this.imageUploadService.generateUploadUrl(type, dto.fileExtension, userId);
    }
}

import { GenerateUploadUrlDto } from "../dto/users/GenerateUploadUrlDto";
import { UploadUrlResponseDto } from "../dto/users/UploadUrlResponseDto";

export interface IGenerateImageUploadUrlUseCase {
    execute(type: string, userId: string, dto: GenerateUploadUrlDto): Promise<UploadUrlResponseDto>;
}

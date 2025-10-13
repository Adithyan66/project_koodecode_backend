

import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IImageUploadService } from '../../interfaces/IImageUploadService';
import { IUpdateProfileImageUseCase } from '../../interfaces/IProfileUseCase';


@injectable()
export class UpdateProfileImageUseCase implements IUpdateProfileImageUseCase {

    constructor(
        @inject('IUserRepository') private userRepository: IUserRepository,
        @inject('IImageUploadService') private imageUploadService: IImageUploadService
    ) { }

    async execute(userId: string, imageKey: string, publicUrl: string): Promise<void> {

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.profilePicKey) {
            try {
                await this.imageUploadService.deleteProfileImage(user.profilePicKey);
            } catch (error) {
                console.error('Failed to delete old profile image:', error);
            }
        }

        await this.userRepository.updateUser(userId, {
            profilePicUrl: publicUrl,
            profilePicKey: imageKey
        });
    }
}



import { IUserRepository } from '../../interfaces/IUserRepository';
import { IImageUploadService } from '../../interfaces/IImageUploadService';

export class UpdateProfileImageUseCase {
    constructor(
        private userRepository: IUserRepository,
        private imageUploadService: IImageUploadService
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

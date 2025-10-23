import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IImageUploadService } from '../../../interfaces/IImageUploadService';

@injectable()
export class ConfirmImageUploadUseCase {
    constructor(
        @inject('IUserRepository') private userRepository: IUserRepository,
        @inject('IImageUploadService') private imageUploadService: IImageUploadService
    ) { }

    async execute(userId: string, imageKey: string, publicUrl: string, imageType: string): Promise<void> {
        console.log('ConfirmImageUploadUseCase.execute called with:', { userId, imageKey, publicUrl, imageType });

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Only update profile image if it's a profile-images type
        if (imageType === 'profile-images') {
            // Delete old profile image if exists
            if (user.profilePicKey) {
                try {
                    await this.imageUploadService.deleteProfileImage(user.profilePicKey);
                } catch (error) {
                    console.error('Failed to delete old profile image:', error);
                }
            }

            // Update user profile with new image
            await this.userRepository.updateUser(userId, {
                profilePicUrl: publicUrl,
                profilePicKey: imageKey
            });
        }
        
        // For other image types (contest-thumbnail, room-thumbnail), we don't update user profile
        // The imageKey and publicUrl are returned to the frontend for their own use
        console.log(`Image upload confirmed for type: ${imageType}. ImageKey: ${imageKey}`);
    }
}



import { IUserProfileRepository } from '../../interfaces/IUserProfileRepository';
import { UpdateProfileDto, UserProfileResponseDto } from '../../dto/users/UserProfileDto';
import { GetUserProfileUseCase } from './GetUserProfileUseCase';
import { IUserRepository } from '../../interfaces/IUserRepository';

export class UpdateUserProfileUseCase {

    constructor(
        private profileRepository: IUserProfileRepository,
        private getUserProfileUseCase: GetUserProfileUseCase,
        private userRepository: IUserRepository
    ) { }


    async execute(userId: string, updateData: UpdateProfileDto): Promise<any> {

        const primaryUpdates: any = {}

        const updates: any = {};

        if (updateData.bio !== undefined) {
            updates.bio = updateData.bio.trim().substring(0, 500);

            if (updateData.fullname !== undefined) {
                primaryUpdates.fullName = updateData.fullname

            }

            if (updateData.bio !== undefined) {
                updates.bio = updateData.bio.trim().substring(0, 500);
            }

            if (updateData.location !== undefined) {
                updates.location = updateData.location.trim();
            }

            if (updateData.birthdate !== undefined) {
                updates.birthdate = new Date(updateData.birthdate);
            }

            if (updateData.gender !== undefined) {
                updates.gender = updateData.gender;
            }

            if (updateData.githubUrl !== undefined) {
                updates.githubUrl = this.validateUrl(updateData.githubUrl, 'github.com');
            }

            if (updateData.linkedinUrl !== undefined) {
                updates.linkedinUrl = this.validateUrl(updateData.linkedinUrl, 'linkedin.com');
            }

            await this.profileRepository.update(userId, updates);

            if (Object.keys(primaryUpdates).length) {

                this.userRepository.updateUser(userId, primaryUpdates)
            }

            return await this.getUserProfileUseCase.execute(userId);
        }
    }

    private validateUrl(url: string, domain: string): string {

        if (!url.trim()) return '';

        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            if (urlObj.hostname.includes(domain)) {
                return urlObj.toString();
            }
        } catch {

        }

        throw new Error(`Invalid ${domain} URL`);
    }
}

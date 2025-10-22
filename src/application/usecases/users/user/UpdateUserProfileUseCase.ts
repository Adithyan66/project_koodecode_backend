

import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { UpdateProfileDto, UserProfileResponseDto } from '../../../dto/users/UserProfileDto';

import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IGetUserProfileUseCase, IUpdateUserProfileUseCase } from '../../../interfaces/IProfileUseCase';
import { inject, injectable } from 'tsyringe';


@injectable()
export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {

    constructor(
        @inject('IUserProfileRepository') private profileRepository: IUserProfileRepository,
        @inject('IGetUserProfileUseCase') private getUserProfileUseCase: IGetUserProfileUseCase,
        @inject('IUserRepository') private userRepository: IUserRepository
    ) { }


    async execute(userId: string, updateData: UpdateProfileDto): Promise<any> {

        const primaryUpdates: any = {}

        const updates: any = {};

        if (updateData.bio !== undefined) {
            updates.bio = updateData.bio.trim().substring(0, 500);
        }

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



import { IUserProfileRepository } from '../../interfaces/IUserProfileRepository';
import { UpdateProfileDto, UserProfileResponseDto } from '../../dto/users/UserProfileDto';
import { GetUserProfileUseCase } from './GetUserProfileUseCase';

export class UpdateUserProfileUseCase {

    constructor(
        private profileRepository: IUserProfileRepository,
        private getUserProfileUseCase: GetUserProfileUseCase
    ) {}


    async execute(userId: string, updateData: UpdateProfileDto): Promise<UserProfileResponseDto> {


        const updates: any = {};

        console.log("updated data ",updateData);
        
        
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

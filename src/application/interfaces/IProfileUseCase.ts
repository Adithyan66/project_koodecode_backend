

import { GenerateUploadUrlDto } from "../dto/users/GenerateUploadUrlDto";
import { UploadUrlResponseDto } from "../dto/users/UploadUrlResponseDto";
import { UpdateProfileDto, UserProfileResponseDto } from "../dto/users/UserProfileDto";

export interface IGetUserProfileForUserUseCase {
    execute(userId: string, year?: number): Promise<UserProfileResponseDto>;
}

export interface IUpdateUserProfileUseCase {
    execute(userId: string, updateData: UpdateProfileDto): Promise<UserProfileResponseDto>;
}


export interface UserEditableProfileResponseDto {
    username: string | undefined;
    fullname: string | undefined;
    email: string;
    profileImageKey: string | undefined;
    bio: string | undefined;
    location: string | undefined;
    birthdate: Date | undefined;
    gender: string | undefined;
    githubUrl: string | undefined;
    linkedinUrl: string | undefined;
}

export interface IGetUserEditableProfile {
    execute(id: string): Promise<UserEditableProfileResponseDto>;
}

export interface IGenerateProfileImageUploadUrlUseCase {
    execute(userId: string, dto: GenerateUploadUrlDto): Promise<UploadUrlResponseDto>;

}

export interface IUpdateProfileImageUseCase {
    execute(userId: string, imageKey: string, publicUrl: string): Promise<void>;
}

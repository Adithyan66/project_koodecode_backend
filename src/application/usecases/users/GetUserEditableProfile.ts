import { inject, injectable } from "tsyringe"
import { IUserProfileRepository } from "../../../domain/interfaces/repositories/IUserProfileRepository"
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository"
import { IGetUserEditableProfile } from "../../interfaces/IProfileUseCase"


@injectable()
export class GetUserEditableProfile implements IGetUserEditableProfile {

    constructor(
        @inject('IUserRepository') private userRepository: IUserRepository,
        @inject('IUserProfileRepository') private profileRepository: IUserProfileRepository
    ) { }

    async execute(id: string) {

        const primaryData = await this.userRepository.findById(id)

        if (!primaryData) {
            throw new Error("user not found ")
        }

        const secondaryData = await this.profileRepository.findByUserId(id)

        return {
            username: primaryData?.userName,
            fullname: primaryData?.fullName,
            email: primaryData?.email,
            profileImageKey: primaryData.profilePicKey,
            bio: secondaryData?.bio,
            location: secondaryData?.location,
            birthdate: secondaryData?.birthdate,
            gender: secondaryData?.gender,
            githubUrl: secondaryData?.githubUrl,
            linkedinUrl: secondaryData?.linkedinUrl,
        }
    }
}


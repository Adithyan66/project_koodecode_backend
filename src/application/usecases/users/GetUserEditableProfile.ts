import { IUserProfileRepository } from "../../interfaces/IUserProfileRepository";
import { IUserRepository } from "../../interfaces/IUserRepository";


export class GetUserEditableProfile {

    constructor(
        private userRepository: IUserRepository,
        private profileRepository: IUserProfileRepository) { }

    async execute(id: string) {

        const primaryData = await this.userRepository.findById(id)

        if(!primaryData){
            throw new Error("user not found ")
        }

        const secondaryData = await this.profileRepository.findByUserId(id)

        return {
            username: primaryData?.userName,
            email: primaryData?.email,
            bio: secondaryData?.bio,
            location: secondaryData?.location,
            birthdate: secondaryData?.birthdate  ,
            gender: secondaryData?.gender,
            githubUrl: secondaryData?.githubUrl,
            linkedinUrl: secondaryData?.linkedinUrl,
        }
    }
}

  
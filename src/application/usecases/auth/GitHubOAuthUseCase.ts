

import { injectable, inject } from "tsyringe";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { IOAuthService } from "../../../domain/interfaces/services/IOAuthService";
import { ITokenService } from "../../../domain/interfaces/services/ITokenService";
import { IUsernameService } from "../../../domain/interfaces/services/IUsernameService";
import { IUserProfileRepository } from "../../../domain/interfaces/repositories/IUserProfileRepository";
import { UserProfile } from "../../../domain/entities/UserProfile";
import { LoginUserResponse } from "../../dto/users/loginUserResponse";
import { SafeUser } from "../../dto/users/safeUser";
import { toLoginUserResponse } from "../../services/userMapper";
import { IGitHubOAuthUseCase } from "../../interfaces/IAuthenticationUseCase";
import { IProfileImageMigrationService } from "../../interfaces/IProfileImageMigrationService";
import { UserBlockedError } from '../../../domain/errors/AuthErrors';


@injectable()
export class GitHubOAuthUseCase implements IGitHubOAuthUseCase{
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository,
    @inject("IOAuthService") private oauthService: IOAuthService,
    @inject("ITokenService") private jwtService: ITokenService,
    @inject("IUsernameService") private usernameService: IUsernameService,
    @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository,
    @inject("IProfileImageMigrationService") private profileImageMigrationService: IProfileImageMigrationService
  ) { }

  async execute(code: string): Promise<LoginUserResponse> {

    const profile = await this.oauthService.verifyGithubToken(code);

    let user = await this.userRepository.findByGithubId(profile.id);
    let isNewUser = false;

    if (!user) {
      user = await this.userRepository.findByEmail(profile.email);

      if (user) {
        const updatedUser = new User({
          ...user,
          githubId: profile.id,
          emailVerified: true
        });
        user = await this.userRepository.updateUser(user.id!, updatedUser);
      } else {
        isNewUser = true;
        
        const newUser = new User({
          fullName: profile.name,
          userName: this.usernameService.generate(profile.name, profile.email),
          email: profile.email,
          provider: "github",
          githubId: profile.id,
          profilePicUrl: profile.picture,
          emailVerified: true,
          role: "user",
          isBlocked: false
        });
        user = await this.userRepository.saveUser(newUser);

        // Migrate profile image to S3 after user creation (so we have the user ID)
        if (profile.picture && user.id) {
          try {
            const profileImageKey = await this.profileImageMigrationService.migrateOAuthProfileImage(
              profile.picture, 
              user.id
            );
            
            // Update user with S3 key
            if (profileImageKey) {
              const updatedUser = new User({
                ...user,
                profilePicKey: profileImageKey
              });
              await this.userRepository.updateUser(user.id, updatedUser);
            }
          } catch (error) {
            console.error('Failed to migrate GitHub profile image:', error);
            // Continue without failing the entire process
          }
        }

        // Create UserProfile with default values for new user
        try {
          const userProfile = new UserProfile({
            userId: user.id!
          });
          await this.userProfileRepository.create(userProfile);
        } catch (error) {
          // Note: User creation rollback not implemented as deleteUser method doesn't exist
          throw new Error("Failed to create user profile. Please contact support.");
        }
      }
    }
    if (!user) {
      throw new Error("failed to create user")
    }

    // Add blocked user check after user is found/created
    if (user.isBlocked) {
        throw new UserBlockedError();
    }

    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id!,
      role: user.role
    });
    const refreshToken = this.jwtService.generateRefreshToken({
      userId: user.id!,
      role: user.role
    });

    const safeUser: SafeUser = {
      id: user.id!,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      isAdmin: user.role === "admin",
      profilePicUrl: user.profilePicUrl,
    };

    const tokens = {
      accessToken,
      refreshToken
    }

    const response = toLoginUserResponse(safeUser, tokens)

    return response

  }

}

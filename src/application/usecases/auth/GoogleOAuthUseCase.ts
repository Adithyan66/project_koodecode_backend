

import { injectable, inject } from "tsyringe";
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IOAuthService } from '../../../domain/interfaces/services/IOAuthService';
import { User } from '../../../domain/entities/User';
import { IUserProfileRepository } from '../../../domain/interfaces/repositories/IUserProfileRepository';
import { UserProfile } from '../../../domain/entities/UserProfile';
import { OAuthUserResponse } from '../../dto/users/OAuthUserResponse';
import { SafeUser } from '../../dto/users/safeUser';
import { toLoginUserResponse } from '../../services/userMapper';
import { LoginUserResponse } from '../../dto/users/loginUserResponse';
import { IGoogleOAuthUseCase } from '../../interfaces/IAuthenticationUseCase';
import { IUsernameService } from '../../../domain/interfaces/services/IUsernameService';
import { ITokenService } from '../../../domain/interfaces/services/ITokenService';
import { IProfileImageMigrationService } from "../../interfaces/IProfileImageMigrationService";



@injectable()
export class GoogleOAuthUseCase implements IGoogleOAuthUseCase {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository,
    @inject("IOAuthService") private oauthService: IOAuthService,
    @inject("ITokenService") private jwtService: ITokenService,
    @inject("IUsernameService") private usernameService: IUsernameService,
    @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository,
    @inject("IProfileImageMigrationService") private profileImageMigrationService: IProfileImageMigrationService
  ) { }

  async execute(token: string): Promise<LoginUserResponse> {

    const profile = await this.oauthService.verifyGoogleToken(token);

    let user = await this.userRepository.findByGoogleId(profile.id);

    let isNewUser = false;

    if (!user) {
      user = await this.userRepository.findByEmail(profile.email);

      if (user) {
        const updatedUser = new User({
          ...user,
          googleId: profile.id,
          emailVerified: true
        });

        user = await this.userRepository.updateUser(user.id!, updatedUser);

      } else {
        isNewUser = true;
        
        const newUser = new User({
          fullName: profile.name,
          userName: this.usernameService.generate(profile.name, profile.email),
          email: profile.email,
          provider: "google",
          googleId: profile.id,
          profilePicUrl: profile.picture,
          emailVerified: true,
          role: "user"
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
            console.error('Failed to migrate Google profile image:', error);
            // Continue without failing the entire process
          }
        }

        // Create UserProfile with default values for new user (Google doesn't provide additional profile URLs)
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
      throw new Error("user creration failed")
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



import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IOAuthService } from '../../../domain/interfaces/services/IOAuthService';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { User } from '../../../domain/entities/User';
import { OAuthUserResponse } from '../../dto/users/OAuthUserResponse';
import { SafeUser } from '../../dto/users/safeUser';
import { toLoginUserResponse } from '../../services/userMapper';
import { LoginUserResponse } from '../../dto/users/loginUserResponse';

export class GoogleOAuthUseCase {
  constructor(
    private userRepository: IUserRepository,
    private oauthService: IOAuthService,
    private jwtService: JwtService
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
          userName: this.generateUsername(profile.name, profile.email),
          email: profile.email,
          provider: "google",
          googleId: profile.id,
          profilePicUrl: profile.picture,
          emailVerified: true,
          role: "user"
        });
        user = await this.userRepository.saveUser(newUser);
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

    console.log("response is inside user",response);
    

    return response
  }





  private generateUsername(name: string, email: string): string {
    const baseName = name.toLowerCase().replace(/\s+/g, '');
    const emailPrefix = email.split('@');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseName || emailPrefix}${randomSuffix}`;
  }
}

import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { IOAuthService } from "../../../domain/interfaces/services/IOAuthService";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { LoginUserResponse } from "../../dto/users/loginUserResponse";
import { OAuthUserResponse } from "../../dto/users/OAuthUserResponse";
import { SafeUser } from "../../dto/users/safeUser";
import { toLoginUserResponse } from "../../services/userMapper";


export class GitHubOAuthUseCase {
  constructor(
    private userRepository: IUserRepository,
    private oauthService: IOAuthService,
    private jwtService: JwtService
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
          userName: this.generateUsername(profile.name, profile.email),
          email: profile.email,
          provider: "github",
          githubId: profile.id,
          profilePicUrl: profile.picture,
          emailVerified: true,
          role: "user"
        });
        user = await this.userRepository.saveUser(newUser);
      }
    }
    if (!user) {
      throw new Error("failed to create user")
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
      id:user.id!,
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

  private generateUsername(name: string, email: string): string {
    const baseName = name.toLowerCase().replace(/\s+/g, '');
    const emailPrefix = email.split('@');
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseName || emailPrefix}${randomSuffix}`;
  }
}

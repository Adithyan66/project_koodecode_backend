


import { Request, Response } from 'express';
import { GoogleOAuthUseCase } from '../../../application/usecases/auth/GoogleOAuthUseCase';
import { GitHubOAuthUseCase } from '../../../application/usecases/auth/GitHubOAuthUseCase';
import { config } from '../../../infrastructure/config/config';

export class OAuthController {
  constructor(
    private googleOAuthUseCase: GoogleOAuthUseCase,
    private githubOAuthUseCase: GitHubOAuthUseCase
  ) { }

  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;


      if (!token) {
        res.status(400).json({ error: 'Google token is required' });
        return;
      }

      const { user } = await this.googleOAuthUseCase.execute(token);

      console.log("this is yuser ", user);


      res.cookie("refreshToken", user.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
        maxAge: config.cookieMaxAge
      });

      res.status(200).json({
        success: true,
        message: "User loged successfully",
        user: {
          fullName: user.fullName,
          userName: user.userName,
          email: user.email,
          profilePicUrl: user.profilePicUrl,
          isAdmin: user.isAdmin,
          token: user.accessToken,
        }
      });

    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Google OAuth failed'
      });
    }
  }




  async githubLogin(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({ error: 'GitHub code is required' });
        return;
      }

      const { user } = await this.githubOAuthUseCase.execute(code);

      res.cookie("refreshToken", user.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
        maxAge: config.cookieMaxAge
      });

      res.status(200).json({
        success: true,
        message: "User loged successfully",
        user: {
          fullName: user.fullName,
          userName: user.userName,
          email: user.email,
          profilePicUrl: user.profilePicUrl,
          isAdmin: user.isAdmin,
          token: user.accessToken,
        }
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'GitHub OAuth failed'
      });
    }
  }
}

import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/usecases/auth/LoginUseCase';
import { config } from '../../../infrastructure/config/config';

export class LoginController {

    constructor(private loginUseCase: LoginUseCase) { }

    async login(req: Request, res: Response) {

        const { email, password } = req.body;


        try {

            const { user } = await this.loginUseCase.execute(email, password);

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
                    id: user.id,
                    fullName: user.fullName,
                    userName: user.userName,
                    email: user.email,
                    profilePicUrl: user.profilePicUrl,
                    isAdmin: user.isAdmin,
                    token: user.accessToken,
                }
            });

        } catch (error: any) {

            res.status(401).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }
}

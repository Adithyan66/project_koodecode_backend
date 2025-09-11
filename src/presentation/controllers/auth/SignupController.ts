

import { Request, Response } from 'express';
import { PasswordService } from '../../../application/services/PasswordService';
import { SignupUseCase } from '../../../application/usecases/users/SignupUseCase'; 
import { IOtpRepository } from '../../../application/interfaces/IOtpRepository';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { config } from '../../../infrastructure/config/config';


export class SignupController {

    constructor(private signupUseCase: SignupUseCase,
        private tokenService: JwtService
    ) {

    }

    async requestOtp(req: Request, res: Response) {

        const { fullName, userName, email } = req.body;

        try {

            const result = await this.signupUseCase.otpRequestExecute(fullName, userName, email)

            res.status(200).json({
                success: true,
                message: "otp sent succesfully",
                result
            });

        } catch (error: any) {

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }



    async verifyOtpAndSignup(req: Request, res: Response) {

        const { email, otp, password } = req.body;

        try {

            const { user } = await this.signupUseCase.verifyOtpAndSignupExecute(email, otp, password)

            res.cookie("refreshToken", user.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                path: "/",
                maxAge: config.cookieMaxAge
            });

            res.status(200).json({
                success: true,
                message: "User signed successfully",
                user: {
                    fullName: user.fullName,
                    userName: user.userName,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: user.accessToken,
                }
            });

        } catch (error: any) {

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

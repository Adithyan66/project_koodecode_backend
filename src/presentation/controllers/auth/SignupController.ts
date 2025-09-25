

import { Request, Response } from 'express';
import { PasswordService } from '../../../application/services/PasswordService';
import { SignupUseCase } from '../../../application/usecases/users/SignupUseCase';

import { IOtpRepository } from '../../../domain/interfaces/repositories/IOtpRepository';
import { JwtService } from '../../../infrastructure/services/JwtService';
import { config } from '../../../infrastructure/config/config';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';


export class SignupController {

    constructor(private signupUseCase: SignupUseCase,
        private tokenService: JwtService
    ) {

    }

    async requestOtp(req: Request, res: Response) {

        const { fullName, userName, email } = req.body;

        try {

            const result = await this.signupUseCase.otpRequestExecute(fullName, userName, email)

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "otp sent succesfully",
                result
            });

        } catch (error: any) {

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
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

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "User signed successfully",
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    userName: user.userName,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: user.accessToken,
                }
            });

        } catch (error: any) {

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }
}

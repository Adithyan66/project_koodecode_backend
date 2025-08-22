

import { Request, Response } from 'express';
import { PasswordService } from '../../domain/services/PasswordService';
import { SignupUseCase } from '../../application/usecases/SignupUseCase';
import { IOtpRepository } from '../../application/interfaces/IOtpRepository';
import { JwtService } from '../../infrastructure/services/JwtService';
import { config } from '../../infrastructure/config/config';


export class SignupController {

    constructor(private signupUseCase: SignupUseCase,
        private tokenService: JwtService
    ) {

    }

    async requestOtp(req: Request, res: Response) {

        const { fullName, userName, email } = req.body;

        try {

            const result = await this.signupUseCase.otpRequestExecute(fullName, userName, email)

            res.status(200).json(result);

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

            console.log("bodyy", req.body)

            const user = await this.signupUseCase.verifyOtpAndSignupExecute(email, otp, password)

            const payload = { userEmail: user.email, role: user.isAdmin };

            const accessToken = this.tokenService.generateAccessToken(payload)

            const refreshToken = this.tokenService.generateRefreshToken(payload)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                path: "/",
                maxAge: config.cookieMaxAge
            });


            res.status(201).json({
                user,
                token: accessToken,
                success: true,
                message: "User created successfully",
            });

        } catch (error: any) {

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

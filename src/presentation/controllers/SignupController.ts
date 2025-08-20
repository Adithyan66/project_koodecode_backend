

import { Request, Response } from 'express';
import { PasswordService } from '../../domain/services/PasswordService';
import { SignupUseCase } from '../../application/usecases/SignupUseCase';
import { IOtpRepository } from '../../application/interfaces/IOtpRepository';


export class SignupController {

    constructor(private signupUseCase: SignupUseCase,
        // private otpService: IOtpRepository
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
            // if (!email || !otp || !password) {
            //     return res.status(400).json({ error: 'Email, OTP, and password are required' });
            // }

            // Verify OTP
            const otpRecord = await this.otpService.getOtp(email);

            if (!otpRecord || otpRecord.otp !== otp) {
                return res.status(400).json({ error: 'Invalid or expired OTP' });
            }

            // Hash password
            const passwordHash = await PasswordService.hashPassword(password);

            // Create user entity and save
            const user = await this.userRepository.saveUser({
                fullName: otpRecord.fullName,
                userName: otpRecord.userName,
                email,
                passwordHash,
                // Set other default fields if needed
            });

            // Optionally, delete used OTP

            res.status(201).json({ message: 'User created successfully', userName: user.userName });

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}



import { injectable, inject } from "tsyringe";
import { IOtpRepository } from '../../../domain/interfaces/repositories/IOtpRepository';
import { IEmailService } from '../../../domain/interfaces/services/IEmailService';
import { IOtpUseCase } from '../../interfaces/IAuthenticationUseCase';



@injectable()
export class OtpUseCase implements IOtpUseCase {
    constructor(
        @inject("IOtpRepository") private otpRepository: IOtpRepository,
        @inject("IEmailService") private emailService: IEmailService
    ) { }

    generateOtp(): string {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    async sendOtp(
        email: string,
        context: "signup" | "forgot",
        extraData?: { fullName: string, userName: string })
        : Promise<void> {

        // const otp = this.generateOtp();

        const otp = 11111

        const ttlSeconds = 60; //1 mins

        const payload: Record<string, any> = { otp };

        if (context === "signup" && extraData) {
            payload.fullName = extraData.fullName;
            payload.userName = extraData.userName;
        }

        await this.otpRepository.saveOtp(email, payload, ttlSeconds);

        const subject = 'Your OTP Code';
        const text = `Your OTP code is: ${otp}. It expires in 1 minutes.`;

        await this.emailService.sendEmail(email, subject, text);
    }

    async verifyOtp(
        email: string,
        context: "signup" | "forgot",
        otp: number)
        : Promise<{ userName?: string; fullName?: string; } | null> {

        const storedOtp = await this.otpRepository.getOtp(email);

        if (!storedOtp) return null

        if (storedOtp.isValid(otp)) {

            if (context == "signup") {
                return {
                    userName: storedOtp.meta.username,
                    fullName: storedOtp.meta.fullname
                }
            } else if (context == 'forgot') {
                return {
                    userName: "storedOtp.meta.username",
                    fullName: "storedOtp.meta.fullname"
                }
            }
        }

        return null;
    }
}

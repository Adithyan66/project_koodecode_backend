import { IOtpRepository } from '../interfaces/IOtpRepository';
import { IEmailService } from '../interfaces/IEmailService';

export class OtpUseCase {
    constructor(
        private otpRepository: IOtpRepository,
        private emailService: IEmailService
    ) { }

    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    }

    async sendOtp(email: string, fullName: string, userName: string): Promise<void> {
        const otp = this.generateOtp();
        const ttlSeconds = 600; // 10 minutes

        const data = { otp, fullName, userName }

        await this.otpRepository.saveOtp(email, data, ttlSeconds);

        const subject = 'Your OTP Code';
        const text = `Your OTP code is: ${otp}. It expires in 10 minutes.`;

        await this.emailService.sendEmail(email, subject, text);
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        const storedOtp = await this.otpRepository.getOtp(email);
        if (storedOtp === otp) {
            await this.otpRepository.deleteOtp(email);
            return true;
        }
        return false;
    }
}

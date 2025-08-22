import { IOtpRepository } from '../interfaces/IOtpRepository';
import { IEmailService } from '../interfaces/IEmailService';

export class OtpUseCase {
    constructor(
        private otpRepository: IOtpRepository,
        private emailService: IEmailService
    ) { }

    generateOtp(): string {
        return Math.floor(10000 + Math.random() * 90000).toString(); // 6-digit OTP
    }

    async sendOtp(email: string, fullName: string, userName: string): Promise<void> {

        const otp = this.generateOtp();

        const ttlSeconds = 600; // 10 minutes

        console.log("otp is - ", otp)

        const data = { otp, fullName, userName }

        console.log("data is ", data);


        await this.otpRepository.saveOtp(email, data, ttlSeconds);

        const subject = 'Your OTP Code';
        const text = `Your OTP code is: ${otp}. It expires in 10 minutes.`;

        await this.emailService.sendEmail(email, subject, text);
    }

    async verifyOtp(email: string, otp: number): Promise<{ userName: string; fullName: string; } | null> {

        const storedOtp = await this.otpRepository.getOtp(email);

        console.log("otp us is ", storedOtp);

        if (!storedOtp) return null

        if (Number(storedOtp.otp) == otp) {
            // await this.otpRepository.deleteOtp(email);
            console.log("be happy")

            return {
                userName: storedOtp.username,
                fullName: storedOtp.fullname
            }
        }
        return null;
    }
}

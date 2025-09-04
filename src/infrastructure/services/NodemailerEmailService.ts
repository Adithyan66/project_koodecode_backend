// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config()

// interface OtpRecord {
//     userName: string;
//     otp: string;
//     fullName: string;
//     expiresAt: Date;
// }

// export class OtpService {
//     private otpStore: Map<string, OtpRecord> = new Map();

//     private transporter;

//     constructor() {
//         this.transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASSWORD,
//             },
//         });
//     }

//     generateOtp(): string {
//         return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//     }

//     async sendOtpEmail(email: string, otp: string) {
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Your OTP Code',
//             text: `Your OTP code for signup is: ${otp}. It will expire in 10 minutes.`,
//         };

//         await this.transporter.sendMail(mailOptions);
//     }

//     async saveOtpForEmail(
//         email: string,
//         o3tp: string,
//         data: { fullName: string; userName: string }
//     ) {
//         const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
//         this.otpStore.set(email, {
//             otp, fullName: data.fullName, userName: data.userName, expiresAt,
//         });
//     }

//     async getOtpByEmail(email: string): Promise<OtpRecord | null> {
//         const record = this.otpStore.get(email);
//         if (!record) return null;

//         // Check if expired
//         if (record.expiresAt < new Date()) {
//             this.otpStore.delete(email);
//             return null;
//         }
//         return record;
//     }

//     async deleteOtp(email: string) {
//         this.otpStore.delete(email);
//     }
// }



import nodemailer from 'nodemailer';
import { IEmailService } from '../../application/interfaces/IEmailService';
import { config } from '../config/config';

export class NodemailerEmailService implements IEmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendEmail(to: string, subject: string, text: string): Promise<void> {
        const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };
        await this.transporter.sendMail(mailOptions);
    }
}

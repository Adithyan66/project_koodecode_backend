


import nodemailer from 'nodemailer';
import { IEmailService } from '../../domain/interfaces/services/IEmailService';

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

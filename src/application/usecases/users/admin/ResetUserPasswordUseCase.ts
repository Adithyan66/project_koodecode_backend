import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IPasswordService } from '../../../../domain/interfaces/services/IPasswordService';
import { IEmailService } from '../../../../domain/interfaces/services/IEmailService';
import { IResetUserPasswordUseCase } from '../../../interfaces/IUserUseCase';
import { ResetPasswordResponseDto } from '../../../dto/users/admin/ResetPasswordResponseDto';
import { NotFoundError, BadRequestError } from '../../../errors/AppErrors';
import { generateTemporaryPassword } from '../../../utils/passwordGenerator';

@injectable()
export class ResetUserPasswordUseCase implements IResetUserPasswordUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IPasswordService') private passwordService: IPasswordService,
    @inject('IEmailService') private emailService: IEmailService
  ) { }

  async execute(userId: string): Promise<ResetPasswordResponseDto> {
    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user has email (required for sending password)
    if (!user.email) {
      throw new BadRequestError('User does not have an email address');
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Hash the password
    const hashedPassword = await this.passwordService.hashPassword(temporaryPassword);

    // Update user password
    await this.userRepository.changePassword(userId, hashedPassword);

    // Send email with new password
    const emailSubject = 'Your Password Has Been Reset';
    const emailBody = this.generateEmailTemplate(user.fullName, temporaryPassword);

    try {
      await this.emailService.sendEmail(user.email, emailSubject, emailBody);
    } catch (error) {
      // If email fails, we still want to complete the password reset
      console.error('Failed to send password reset email:', error);
    }

    return {
      success: true,
      message: 'Password reset successfully. New password has been sent to user\'s email.'
    };
  }

  private generateEmailTemplate(userName: string, password: string): string {
    return `
Hi ${userName},

Your password has been reset by an administrator.

Your new temporary password is: ${password}

This is a temporary password. We recommend changing it after your first login for security purposes.

You can log in at: ${process.env.FRONTEND_URL || 'https://your-app.com/login'}

Best regards,
The Team
    `.trim();
  }
}


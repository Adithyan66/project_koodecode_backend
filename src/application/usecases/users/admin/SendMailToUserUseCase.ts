import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../../domain/interfaces/repositories/IUserRepository';
import { IEmailService } from '../../../../domain/interfaces/services/IEmailService';
import { ISendMailToUserUseCase } from '../../../interfaces/IUserUseCase';
import { SendMailRequestDto, SendMailResponseDto } from '../../../dto/users/admin/SendMailDto';
import { NotFoundError, BadRequestError } from '../../../errors/AppErrors';

@injectable()
export class SendMailToUserUseCase implements ISendMailToUserUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IEmailService') private emailService: IEmailService
  ) {}

  async execute(userId: string, mailData: SendMailRequestDto): Promise<SendMailResponseDto> {
    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user has email
    if (!user.email) {
      throw new BadRequestError('User does not have an email address');
    }

    // Validate mail data
    if (!mailData.subject || !mailData.subject.trim()) {
      throw new BadRequestError('Subject is required');
    }

    if (!mailData.message || !mailData.message.trim()) {
      throw new BadRequestError('Message is required');
    }

    // Send email
    try {
      await this.emailService.sendEmail(user.email, mailData.subject, mailData.message);
      
      return {
        success: true,
        message: 'Email sent successfully to user.'
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new BadRequestError('Failed to send email. Please try again later.');
    }
  }
}


import { inject, injectable } from 'tsyringe';
import { ICoinTransactionRepository } from '../../../../domain/interfaces/repositories/ICoinTransactionRepository';
import { ICoinPurchaseRepository } from '../../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IGetUserFinancialDataUseCase } from '../../../interfaces/IUserUseCase';
import { UserFinancialDataDto } from '../../../dto/users/admin/UserFinancialDataDto';
import { NotFoundError } from '../../../errors/AppErrors';

@injectable()
export class GetUserFinancialDataUseCase implements IGetUserFinancialDataUseCase {
  constructor(
    @inject('ICoinTransactionRepository') private coinTransactionRepository: ICoinTransactionRepository,
    @inject('ICoinPurchaseRepository') private coinPurchaseRepository: ICoinPurchaseRepository,
    @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository
  ) {}

  async execute(
    userId: string, 
    coinPage: number, 
    coinLimit: number, 
    paymentPage: number, 
    paymentLimit: number
  ): Promise<UserFinancialDataDto> {
    // Validate user exists
    const userProfile = await this.userProfileRepository.findByUserId(userId);
    if (!userProfile) {
      throw new NotFoundError('User not found');
    }

    // Get total earned and spent
    const [totalEarned, totalSpent] = await Promise.all([
      this.coinTransactionRepository.getTotalEarnedByUser(userId),
      this.coinTransactionRepository.getTotalSpentByUser(userId)
    ]);

    // Get paginated coin transactions
    const [transactions, transactionCount] = await Promise.all([
      this.coinTransactionRepository.findByUserIdPaginated(userId, coinPage, coinLimit),
      this.coinTransactionRepository.countByUserId(userId)
    ]);

    // Get paginated payment history
    const [payments, paymentCount] = await Promise.all([
      this.coinPurchaseRepository.findByUserIdPaginated(userId, paymentPage, paymentLimit),
      this.coinPurchaseRepository.countByUserId(userId)
    ]);

    // Map transactions to DTO
    const coinTransactions = transactions.map(transaction => ({
      transactionId: transaction.id || '',
      type: transaction.type as 'earn' | 'spend',
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString()
    }));

    // Map payments to DTO
    const paymentHistory = payments.map(payment => ({
      paymentId: payment.id || '',
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt.toISOString()
    }));

    // Calculate pagination metadata
    const transactionTotalPages = Math.ceil(transactionCount / coinLimit);
    const paymentTotalPages = Math.ceil(paymentCount / paymentLimit);

    return {
      totalSpent,
      totalEarned,
      coinTransactions,
      coinTransactionsPagination: {
        page: coinPage,
        limit: coinLimit,
        total: transactionCount,
        totalPages: transactionTotalPages
      },
      paymentHistory,
      paymentHistoryPagination: {
        page: paymentPage,
        limit: paymentLimit,
        total: paymentCount,
        totalPages: paymentTotalPages
      }
    };
  }
}


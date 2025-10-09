import { Request, Response } from 'express';
import { AwardCoinsUseCase } from '../../../application/usecases/coins/AwardCoinsUseCase';
import { SpendCoinsUseCase } from '../../../application/usecases/coins/SpendCoinsUseCase';
import { GetCoinBalanceUseCase } from '../../../application/usecases/coins/GetCoinBalanceUseCase';
import { GetCoinTransactionsUseCase } from '../../../application/usecases/coins/GetCoinTransactionsUseCase';
import { GetCoinStatsUseCase } from '../../../application/usecases/coins/GetCoinStatsUseCase';
import { CoinTransactionSource } from '../../../domain/entities/CoinTransaction';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

export class CoinController {
    constructor(
        private awardCoinsUseCase: AwardCoinsUseCase,
        private spendCoinsUseCase: SpendCoinsUseCase,
        private getCoinBalanceUseCase: GetCoinBalanceUseCase,
        private getCoinTransactionsUseCase: GetCoinTransactionsUseCase,
        private getCoinStatsUseCase: GetCoinStatsUseCase
    ) { }

    async getBalance(req: Request, res: Response): Promise<void> {
        try {

            const userId = req.user?.userId;

            const balance = await this.getCoinBalanceUseCase.execute(userId!);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                balance,
            });

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to get coin balance',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getTransactions(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;

            const transactions = await this.getCoinTransactionsUseCase.execute(userId, limit, offset);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    transactions: transactions.map(t => ({
                        id: t.id,
                        amount: t.amount,
                        type: t.type,
                        source: t.source,
                        description: t.description,
                        metadata: t.metadata,
                        createdAt: t.createdAt.toISOString(),
                        displayAmount: t.getDisplayAmount()
                    })),
                    pagination: {
                        limit,
                        offset,
                        hasMore: transactions.length === limit
                    }
                }
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to get coin transactions',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const stats = await this.getCoinStatsUseCase.execute(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to get coin stats',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async awardCoins(req: Request, res: Response): Promise<void> {
        try {
            const { userId, amount, source, description, metadata } = req.body;

            if (!userId || !amount || !source || !description) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Missing required fields: userId, amount, source, description'
                });
                return;
            }

            if (!Object.values(CoinTransactionSource).includes(source)) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid coin transaction source'
                });
                return;
            }

            const transaction = await this.awardCoinsUseCase.execute(
                userId,
                amount,
                source as CoinTransactionSource,
                description,
                metadata
            );

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: {
                    transaction: {
                        id: transaction.id,
                        userId: transaction.userId,
                        amount: transaction.amount,
                        type: transaction.type,
                        source: transaction.source,
                        description: transaction.description,
                        createdAt: transaction.createdAt.toISOString()
                    }
                }
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to award coins',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

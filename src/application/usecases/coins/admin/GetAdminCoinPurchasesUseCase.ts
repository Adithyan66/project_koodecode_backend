import { inject, injectable } from 'tsyringe';
import { ICoinPurchaseRepository } from '../../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IGetAdminCoinPurchasesUseCase } from '../../../interfaces/ICoinUseCase';
import { AdminCoinPurchaseListRequestDto, AdminCoinPurchaseListResponseDto, AdminCoinPurchaseItemDto, AdminCoinPurchaseStatsDto } from '../../../dto/coins/admin/CoinPurchaseDto';
import { BadRequestError } from '../../../errors/AppErrors';

@injectable()
export class GetAdminCoinPurchasesUseCase implements IGetAdminCoinPurchasesUseCase {
    constructor(
        @inject('ICoinPurchaseRepository') private coinPurchaseRepository: ICoinPurchaseRepository
    ) {}

    async execute(request: AdminCoinPurchaseListRequestDto): Promise<AdminCoinPurchaseListResponseDto> {
        // Validate page
        if (request.page < 1) {
            throw new BadRequestError('Page must be greater than 0');
        }

        // Validate limit
        if (request.limit < 1 || request.limit > 100) {
            throw new BadRequestError('Limit must be between 1 and 100');
        }

        // Validate status
        if (request.status && !['pending', 'completed', 'failed', 'cancelled'].includes(request.status)) {
            throw new BadRequestError('Invalid status. Must be pending, completed, failed, or cancelled');
        }

        // Validate paymentMethod
        if (request.paymentMethod && !['upi', 'card', 'net_banking', 'wallet', 'emi'].includes(request.paymentMethod)) {
            throw new BadRequestError('Invalid payment method');
        }

        // Validate dateRange
        if (request.dateRange && !['this_month', 'last_month', 'custom'].includes(request.dateRange)) {
            throw new BadRequestError('Invalid date range. Must be this_month, last_month, or custom');
        }

        // Validate dateRange and dates
        if (request.dateRange === 'custom') {
            if (!request.startDate || !request.endDate) {
                throw new BadRequestError('startDate and endDate are required when dateRange is custom');
            }
        }

        // Map dateRange to actual dates
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (request.dateRange === 'this_month') {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = now;
        } else if (request.dateRange === 'last_month') {
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        } else if (request.dateRange === 'custom' && request.startDate && request.endDate) {
            startDate = new Date(request.startDate);
            endDate = new Date(request.endDate);
        }

        // Validate sortBy
        const validSortFields = ['createdAt', 'completedAt', 'amount', 'coins', 'status'];
        if (request.sortBy && !validSortFields.includes(request.sortBy)) {
            throw new BadRequestError(`Invalid sortBy. Must be one of: ${validSortFields.join(', ')}`);
        }

        // Validate sortOrder
        if (request.sortOrder && !['asc', 'desc'].includes(request.sortOrder)) {
            throw new BadRequestError('Invalid sortOrder. Must be asc or desc');
        }

        // Fetch purchases with filters
        const purchasesResult = await this.coinPurchaseRepository.findAllWithFiltersAndUserDetails({
            search: request.search,
            status: request.status,
            paymentMethod: request.paymentMethod,
            startDate,
            endDate,
            sortBy: request.sortBy,
            sortOrder: request.sortOrder || 'desc',
            page: request.page,
            limit: request.limit
        });

        // Fetch stats with the same filters (for this month)
        const statsStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const statsEndDate = new Date();
        
        const statsResult = await this.coinPurchaseRepository.getStatsByFilters({
            status: request.status,
            paymentMethod: request.paymentMethod,
            startDate: statsStartDate,
            endDate: statsEndDate
        });

        // Transform to DTOs
        const purchaseDtos = purchasesResult.purchases.map(p => new AdminCoinPurchaseItemDto({
            id: p.id!,
            userId: p.userId,
            userEmail: p.userEmail,
            userName: p.userName,
            coins: p.coins,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            paymentMethod: p.paymentMethod,
            externalOrderId: p.externalOrderId,
            createdAt: p.createdAt,
            completedAt: p.completedAt
        }));

        const statsDto = new AdminCoinPurchaseStatsDto({
            totalPurchasesThisMonth: statsResult.totalPurchases,
            totalRevenueThisMonth: statsResult.totalRevenue,
            pendingPurchases: statsResult.pendingCount,
            failedPurchases: statsResult.failedCount,
            currency: 'INR'
        });

        const totalPages = Math.ceil(purchasesResult.total / request.limit);

        return new AdminCoinPurchaseListResponseDto({
            purchases: purchaseDtos,
            stats: statsDto,
            pagination: {
                page: request.page,
                limit: request.limit,
                total: purchasesResult.total,
                totalPages
            }
        });
    }
}


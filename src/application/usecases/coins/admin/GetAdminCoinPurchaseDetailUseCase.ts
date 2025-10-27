import { inject, injectable } from 'tsyringe';
import { ICoinPurchaseRepository } from '../../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IGetAdminCoinPurchaseDetailUseCase } from '../../../interfaces/ICoinUseCase';
import { AdminCoinPurchaseDetailDto } from '../../../dto/coins/admin/CoinPurchaseDto';
import { NotFoundError } from '../../../errors/AppErrors';

@injectable()
export class GetAdminCoinPurchaseDetailUseCase implements IGetAdminCoinPurchaseDetailUseCase {
    constructor(
        @inject('ICoinPurchaseRepository') private coinPurchaseRepository: ICoinPurchaseRepository
    ) {}

    async execute(purchaseId: string): Promise<AdminCoinPurchaseDetailDto> {

        if (!purchaseId || purchaseId.trim().length === 0) {
            throw new NotFoundError('Purchase ID is required');
        }

        const result = await this.coinPurchaseRepository.findByIdWithUserDetails(purchaseId);

        if (!result) {
            throw new NotFoundError('Purchase not found');
        }

        const { purchase, user, notesWithUsers, refundedByUser } = result;

        const canReconcile = purchase.canBeReconciled();
        const isStale = purchase.isStale();

        return new AdminCoinPurchaseDetailDto({
            purchase,
            user,
            canReconcile,
            isStale,
            notesWithUsers,
            refundedByUser
        });
    }
}


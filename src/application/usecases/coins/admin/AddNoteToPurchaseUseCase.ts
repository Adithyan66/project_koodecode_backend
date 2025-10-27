import { inject, injectable } from 'tsyringe';
import { ICoinPurchaseRepository } from '../../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { IAddNoteToPurchaseUseCase } from '../../../interfaces/ICoinUseCase';
import { AddNoteResponseDto } from '../../../dto/coins/admin/CoinPurchaseDto';
import { NotFoundError, BadRequestError } from '../../../errors/AppErrors';

@injectable()
export class AddNoteToPurchaseUseCase implements IAddNoteToPurchaseUseCase {
    constructor(
        @inject('ICoinPurchaseRepository') private coinPurchaseRepository: ICoinPurchaseRepository
    ) { }

    async execute(purchaseId: string, adminId: string, note: string): Promise<AddNoteResponseDto> {
        if (!purchaseId || purchaseId.trim().length === 0) {
            throw new BadRequestError('Purchase ID is required');
        }

        if (!note || note.trim().length === 0) {
            throw new BadRequestError('Note text is required');
        }

        const purchase = await this.coinPurchaseRepository.findById(purchaseId);

        if (!purchase) {
            throw new NotFoundError('Purchase not found');
        }

        purchase.addNote(note, adminId);

        await this.coinPurchaseRepository.update(purchase.id!, purchase);

        return new AddNoteResponseDto({
            success: true,
            message: 'Note added successfully'
        });
    }
}


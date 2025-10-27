



import { IPaymentGatewayService } from '../../../../domain/interfaces/services/IPaymentGatewayService';
import { ICoinPurchaseRepository } from '../../../../domain/interfaces/repositories/ICoinPurchaseRepository';
import { ICoinService } from '../../../../domain/interfaces/services/ICoinService';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { CoinPurchase } from '../../../../domain/entities/CoinPurchase';
import { CreateCoinPurchaseOrderDto, CoinPurchaseOrderResponseDto } from '../../../dto/coins/CoinPurchaseDto';
import { inject, injectable } from 'tsyringe';
import { ICreateCoinPurchaseOrderUseCase } from '../../../interfaces/ICoinUseCase';
import { 
    UserProfileNotFoundError,
    InvalidCoinPackageError,
    PaymentOrderCreationError,
    CoinPurchaseRecordError
} from '../../../../domain/errors/CoinErrors';
import { MissingFieldsError } from '../../../../domain/errors/AuthErrors';



@injectable()
export class CreateCoinPurchaseOrderUseCase implements ICreateCoinPurchaseOrderUseCase {
    
    constructor(
        @inject("IPaymentGatewayService") private paymentGatewayService: IPaymentGatewayService,
        @inject("ICoinPurchaseRepository") private coinPurchaseRepository: ICoinPurchaseRepository,
        @inject("ICoinService") private coinService: ICoinService,
        @inject("IUserProfileRepository") private userProfileRepository: IUserProfileRepository
    ) { }

    async execute(userId: string, dto: CreateCoinPurchaseOrderDto): Promise<CoinPurchaseOrderResponseDto> {

        this.validateInputs(userId, dto);

        const userProfile = await this.userProfileRepository.findByUserId(userId);
        if (!userProfile) {
            throw new UserProfileNotFoundError(userId);
        }

        if (!this.coinService.validateCoinPackage(dto.coins)) {
            throw new InvalidCoinPackageError(dto.coins);
        }

        const amount = this.coinService.calculateCoinPrice(dto.coins);
        const receipt = this.generateReceipt(userId);

        try {
            const paymentOrder = await this.paymentGatewayService.createOrder(
                amount,
                'INR',
                receipt,
                { userId, coins: dto.coins }
            );

            const purchase = new CoinPurchase({
                userId,
                coins: dto.coins,
                amount,
                currency: 'INR',
                paymentMethod: undefined, 
                externalOrderId: paymentOrder.orderId,
                receipt: receipt
            });

            const savedPurchase = await this.coinPurchaseRepository.create(purchase);

            return new CoinPurchaseOrderResponseDto({
                purchaseId: savedPurchase.id!,
                orderId: paymentOrder.orderId,
                key: paymentOrder.key,
                amount,
                coins: dto.coins,
                currency: 'INR'
            });

        } catch (error) {
            if (error instanceof UserProfileNotFoundError ||
                error instanceof InvalidCoinPackageError) {
                throw error;
            }

            if (error instanceof Error && error.message.includes('payment')) {
                throw new PaymentOrderCreationError(error.message);
            }

            throw new CoinPurchaseRecordError('Failed to create purchase order');
        }
    }

    private validateInputs(userId: string, dto: CreateCoinPurchaseOrderDto): void {
        const missingFields: string[] = [];
        
        if (!userId) missingFields.push("userId");
        if (!dto?.coins) missingFields.push("coins");

        if (missingFields.length > 0) {
            throw new MissingFieldsError(missingFields);
        }
    }

    private generateReceipt(userId: string): string {
        const timestamp = Date.now().toString();
        const shortUserId = userId.slice(-8);
        return `cp_${shortUserId}_${timestamp.slice(-8)}`;
    }
}

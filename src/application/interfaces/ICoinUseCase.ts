

import { CoinTransaction } from "../../domain/entities/CoinTransaction";
import { UserCoinStats } from "../../domain/interfaces/repositories/ICoinTransactionRepository";
import { CreateCoinPurchaseOrderDto, CoinPurchaseOrderResponseDto, CompletePurchaseDto } from "../dto/coins/CoinPurchaseDto";
import { AdminCoinPurchaseListRequestDto, AdminCoinPurchaseListResponseDto, AdminCoinPurchaseDetailDto, ReconcilePurchaseResponseDto, RefundPurchaseResponseDto, AddNoteResponseDto } from "../dto/coins/admin/CoinPurchaseDto";

export interface ICreateCoinPurchaseOrderUseCase {
    execute(userId: string, dto: CreateCoinPurchaseOrderDto): Promise<CoinPurchaseOrderResponseDto>;
}


export interface ICompleteCoinPurchaseUseCase {
  execute(dto: CompletePurchaseDto): Promise<{
    message: string;
    coins: number;
    paymentMethod: string;
  }>;
}


export interface IGetCoinBalanceUseCase {
  execute(userId: string): Promise<number>;
}


export interface IGetCoinTransactionsUseCase {
    execute(userId: string, limit?: number, offset?: number): Promise<CoinTransaction[]>;
}


export interface IGetCoinStatsUseCase {
    execute(userId: string): Promise<UserCoinStats>;
}

export interface ICheckSufficientBalanceUseCase {
    execute(userId: string, amount: number): Promise<boolean>;
}

export interface IGetAdminCoinPurchasesUseCase {
    execute(request: AdminCoinPurchaseListRequestDto): Promise<AdminCoinPurchaseListResponseDto>;
}

export interface IGetAdminCoinPurchaseDetailUseCase {
    execute(purchaseId: string): Promise<AdminCoinPurchaseDetailDto>;
}

export interface IReconcileCoinPurchaseUseCase {
    execute(purchaseId: string, notes?: string): Promise<ReconcilePurchaseResponseDto>;
}

export interface IRefundCoinPurchaseUseCase {
    execute(purchaseId: string, adminId: string, notes: string): Promise<RefundPurchaseResponseDto>;
}

export interface IAddNoteToPurchaseUseCase {
    execute(purchaseId: string, adminId: string, note: string): Promise<AddNoteResponseDto>;
}



import { CoinTransaction } from "../../domain/entities/CoinTransaction";
import { UserCoinStats } from "../../domain/interfaces/repositories/ICoinTransactionRepository";
import { CreateCoinPurchaseOrderDto, CoinPurchaseOrderResponseDto, CompletePurchaseDto } from "../dto/coins/CoinPurchaseDto";

export interface ICreateCoinPurchaseOrderUseCase {
    execute(userId: string, dto: CreateCoinPurchaseOrderDto): Promise<CoinPurchaseOrderResponseDto>;
}


export interface ICompleteCoinPurchaseUseCase {
  execute(dto: CompletePurchaseDto): Promise<{
    message: string;
    coins: number;
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

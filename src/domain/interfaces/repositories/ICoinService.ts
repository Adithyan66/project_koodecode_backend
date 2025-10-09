
export interface ICoinService {
    calculateCoinPrice(coins: number): number;
    validateCoinPackage(coins: number): boolean;
    getAvailableCoinPackages(): CoinPackage[];
}

export interface CoinPackage {
    coins: number;
    price: number;
    discount?: number;
    popular?: boolean;
}

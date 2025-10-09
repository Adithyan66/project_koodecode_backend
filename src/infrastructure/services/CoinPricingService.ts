import { ICoinService, CoinPackage } from '../../domain/interfaces/services/ICoinService';

export class CoinPricingService implements ICoinService {
    private readonly coinPackages: CoinPackage[] = [
        { coins: 100, price: 100 },
        { coins: 500, price: 500, popular: true },
        { coins: 1000, price: 1000 }
    ];

    calculateCoinPrice(coins: number): number {
        // Simple 1:1 ratio for now, but can be extended for complex pricing
        return coins;
    }

    validateCoinPackage(coins: number): boolean {
        return this.coinPackages.some(pkg => pkg.coins === coins);
    }

    getAvailableCoinPackages(): CoinPackage[] {
        return [...this.coinPackages];
    }
}

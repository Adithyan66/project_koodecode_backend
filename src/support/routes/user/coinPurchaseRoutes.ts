

import express from 'express';
import { CoinPurchaseController } from '../../../support/controllers/users/CoinPurchaseController';
import { authMiddleware } from '../../../support/middleware/authMiddleware';

import { RazorpayGatewayService } from '../../../infrastructure/services/RazorpayGatewayService';
import { CoinPricingService } from '../../../infrastructure/services/CoinPricingService';
import { MongoCoinPurchaseRepository } from '../../../infrastructure/db/MongoCoinPurchaseRepository';
import { MongoUserProfileRepository } from '../../../infrastructure/db/MongoUserProfileRepository';
import { MongoCoinTransactionRepository } from '../../../infrastructure/db/MongoCoinTransactionRepository';
import { CreateCoinPurchaseOrderUseCase } from '../../../application/usecases/coins/CreateCoinPurchaseOrderUseCase';
import { CompleteCoinPurchaseUseCase } from '../../../application/usecases/coins/CompleteCoinPurchaseUseCase';

const router = express.Router();

const paymentGatewayService = new RazorpayGatewayService();
const coinService = new CoinPricingService();

const coinPurchaseRepository = new MongoCoinPurchaseRepository();
const userProfileRepository = new MongoUserProfileRepository();
const coinTransactionRepository = new MongoCoinTransactionRepository();

const createOrderUseCase = new CreateCoinPurchaseOrderUseCase(
    paymentGatewayService,
    coinPurchaseRepository,
    coinService,
    userProfileRepository
);

const completePurchaseUseCase = new CompleteCoinPurchaseUseCase(
    paymentGatewayService,
    coinPurchaseRepository,
    userProfileRepository,
    coinTransactionRepository
);

const coinPurchaseController = new CoinPurchaseController(createOrderUseCase, completePurchaseUseCase);

router.post('/create-order', authMiddleware(), (req, res) => coinPurchaseController.createOrder(req, res));
router.post('/complete', authMiddleware(), (req, res) => coinPurchaseController.completePurchase(req, res));

export default router;

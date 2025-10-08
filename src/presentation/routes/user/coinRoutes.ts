import express from 'express';
import { CoinController } from '../../controllers/users/CoinController';
import { authMiddleware } from '../../middleware/authMiddleware';

import { MongoCoinTransactionRepository } from '../../../infrastructure/db/MongoCoinTransactionRepository';
import { MongoUserProfileRepository } from '../../../infrastructure/db/MongoUserProfileRepository';
import { AwardCoinsUseCase } from '../../../application/usecases/coins/AwardCoinsUseCase';
import { SpendCoinsUseCase } from '../../../application/usecases/coins/SpendCoinsUseCase';
import { GetCoinBalanceUseCase } from '../../../application/usecases/coins/GetCoinBalanceUseCase';
import { GetCoinTransactionsUseCase } from '../../../application/usecases/coins/GetCoinTransactionsUseCase';
import { GetCoinStatsUseCase } from '../../../application/usecases/coins/GetCoinStatsUseCase';

const router = express.Router();

const coinTransactionRepository = new MongoCoinTransactionRepository();
const userProfileRepository = new MongoUserProfileRepository();

const awardCoinsUseCase = new AwardCoinsUseCase(coinTransactionRepository, userProfileRepository);
const spendCoinsUseCase = new SpendCoinsUseCase(coinTransactionRepository, userProfileRepository);
const getCoinBalanceUseCase = new GetCoinBalanceUseCase(userProfileRepository);
const getCoinTransactionsUseCase = new GetCoinTransactionsUseCase(coinTransactionRepository);
const getCoinStatsUseCase = new GetCoinStatsUseCase(coinTransactionRepository);

const coinController = new CoinController(
    awardCoinsUseCase,
    spendCoinsUseCase,
    getCoinBalanceUseCase,
    getCoinTransactionsUseCase,
    getCoinStatsUseCase
);

router.get('/balance', authMiddleware(), (req, res) => coinController.getBalance(req, res));
router.get('/transactions', authMiddleware(), (req, res) => coinController.getTransactions(req, res));
router.get('/stats', authMiddleware(), (req, res) => coinController.getStats(req, res));


router.post('/award', authMiddleware("admin"), (req, res) => coinController.awardCoins(req, res));

export default router;



import express from 'express';
import { StoreController } from '../../../support/controllers/users/StoreController';
import { authMiddleware } from '../../../support/middleware/authMiddleware';

import { MongoStoreItemRepository } from '../../../infrastructure/db/MongoStoreItemRepository';
import { MongoUserInventoryRepository } from '../../../infrastructure/db/MongoUserInventoryRepository';
import { MongoUserProfileRepository } from '../../../infrastructure/db/MongoUserProfileRepository';
import { MongoCoinTransactionRepository } from '../../../infrastructure/db/MongoCoinTransactionRepository';
import { GetStoreItemsUseCase } from '../../../application/usecases/store/GetStoreItemsUseCase';
import { PurchaseStoreItemUseCase } from '../../../application/usecases/store/PurchaseStoreItemUseCase';
import { GetUserInventoryUseCase } from '../../../application/usecases/store/GetUserInventoryUseCase';
import { CheckItemOwnershipUseCase } from '../../../application/usecases/store/CheckItemOwnershipUseCase';

const router = express.Router();

const storeItemRepository = new MongoStoreItemRepository();
const userInventoryRepository = new MongoUserInventoryRepository();
const userProfileRepository = new MongoUserProfileRepository();
const coinTransactionRepository = new MongoCoinTransactionRepository();

const getStoreItemsUseCase = new GetStoreItemsUseCase(storeItemRepository, userInventoryRepository);
const purchaseStoreItemUseCase = new PurchaseStoreItemUseCase(
    storeItemRepository,
    userInventoryRepository,
    userProfileRepository,
    coinTransactionRepository
);
const getUserInventoryUseCase = new GetUserInventoryUseCase(userInventoryRepository, storeItemRepository);
const checkItemOwnershipUseCase = new CheckItemOwnershipUseCase(userInventoryRepository);

const storeController = new StoreController(
    getStoreItemsUseCase,
    purchaseStoreItemUseCase,
    getUserInventoryUseCase,
    checkItemOwnershipUseCase
);

router.get('/items', authMiddleware(), (req, res) => storeController.getStoreItems(req, res));
router.post('/purchase', authMiddleware(), (req, res) => storeController.purchaseItem(req, res));
router.get('/inventory', authMiddleware(), (req, res) => storeController.getUserInventory(req, res));
router.get('/ownership/:itemId', authMiddleware(), (req, res) => storeController.checkItemOwnership(req, res));

export default router;

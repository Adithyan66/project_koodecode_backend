

import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { authMiddleware } from '../../../../support/middleware/authMiddleware';
import { container } from "../../../../infrastructure/config/container";
import { AuthController } from '../../http/controllers/authentication/AuthController';



const router = Router();

router.post('/award', authMiddleware("admin"), (req, res) => coinController.awardCoins(req, res));


export default router;

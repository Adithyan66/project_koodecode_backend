


import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminContestController } from '../../../http/controllers/admin/AdminContestController';
import { adminOnly } from '../../middlewares';



const router = Router();
const adminContestController = container.resolve(AdminContestController);

router.post('/create', adminOnly, expressAdapter(adminContestController.createContest));

export default router;




import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminContestController } from '../../../http/controllers/admin/AdminContestController';
import { adminOnly } from '../../middlewares';



const router = Router();
const adminContestController = container.resolve(AdminContestController);

router.post('/create', adminOnly, expressAdapter(adminContestController.createContest));
router.get('/active', adminOnly, expressAdapter(adminContestController.getActiveContests));
router.get('/upcoming', adminOnly, expressAdapter(adminContestController.getUpcomingContests));
router.get('/past', adminOnly, expressAdapter(adminContestController.getPastContests));
router.get('/:contestId', adminOnly, expressAdapter(adminContestController.getContestById));
router.patch('/:contestId', adminOnly, expressAdapter(adminContestController.updateContest));
router.delete('/:contestId', adminOnly, expressAdapter(adminContestController.deleteContest));

export default router;

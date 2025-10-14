


import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { UserContestController } from '../../../http/controllers/user/UserContestController';
import { authenticate } from '../../middlewares';



const router = Router();
const userContestController = container.resolve(UserContestController);





router.get('/:contestNumber', authenticate, expressAdapter(userContestController.getContestDetail));
router.post('/register', authenticate, expressAdapter(userContestController.registerForContest));
router.get('/:contestNumber/start', authenticate, expressAdapter(userContestController.startContestProblem));
router.post('/submit-solution', authenticate, expressAdapter(userContestController.submitSolution));
router.get('/:contestNumber/leaderboard', authenticate, expressAdapter(userContestController.getLeaderboard));
router.get('/state/:state', authenticate, expressAdapter(userContestController.getActiveContests));




export default router;


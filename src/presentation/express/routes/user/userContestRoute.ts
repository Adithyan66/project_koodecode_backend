


import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { authMiddleware } from '../../../../support/middleware/authMiddleware';
import { container } from "../../../../infrastructure/config/container";
import { UserContestController } from '../../../http/controllers/user/UserContestController';



const router = Router();
const userContestController = container.resolve(UserContestController);

router.get('/:contestNumber', authMiddleware(), expressAdapter(userContestController.getContestDetail));

router.post('/register', authMiddleware(), expressAdapter(userContestController.registerForContest));

router.get('/:contestNumber/start', authMiddleware(), expressAdapter(userContestController.startContestProblem));

router.post('/submit-solution', authMiddleware(), expressAdapter(userContestController.submitSolution));

router.get('/:contestNumber/leaderboard', authMiddleware(), expressAdapter(userContestController.getLeaderboard));

router.get('/state/:state', authMiddleware(), expressAdapter(userContestController.getActiveContests));




export default router;


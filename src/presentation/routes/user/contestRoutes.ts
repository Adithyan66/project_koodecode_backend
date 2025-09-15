

import { Router } from 'express';
import { UserContestController } from '../../controllers/users/contests/UserContestController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { RegisterForContestUseCase } from '../../../application/usecases/contests/RegisterForContestUseCase';
import { MongoContestRepository } from '../../../infrastructure/db/MongoContestRepository';
import { MongoContestParticipantRepository } from '../../../infrastructure/db/MongoContestParticipantRepository';
import { MongoProblemRepository } from '../../../infrastructure/db/MongoProblemRepository';
import { StartContestProblemUseCase } from '../../../application/usecases/contests/StartContestProblemUseCase';
import { ContestTimerService } from '../../../application/services/ContestTimerService';
import { GetContestLeaderboardUseCase } from '../../../application/usecases/contests/GetContestLeaderboardUseCase';
import { MongoUserRepository } from '../../../infrastructure/db/MongoUserRepository';
import { GetContestsListUseCase } from '../../../application/usecases/contests/GetContestsListUseCase';
const router = Router();

const contestRepository = new MongoContestRepository()
const participantRepository = new MongoContestParticipantRepository()
const problemRepository = new MongoProblemRepository()

const registerForContestUseCase = new RegisterForContestUseCase(contestRepository, participantRepository, problemRepository)

const timerService = new ContestTimerService()
const userRepository = new MongoUserRepository()
const getContestsListUseCase = new GetContestsListUseCase(contestRepository)

const startContestProblemUseCase = new StartContestProblemUseCase(contestRepository, participantRepository, problemRepository, timerService)
const getContestLeaderboardUseCase = new GetContestLeaderboardUseCase(contestRepository, participantRepository, userRepository)
const userContestController = new UserContestController(registerForContestUseCase, startContestProblemUseCase, getContestLeaderboardUseCase,getContestsListUseCase)



router.post('/register', authMiddleware, userContestController.registerForContest.bind(userContestController));
router.get('/:contestId/start', authMiddleware, userContestController.startContestProblem.bind(userContestController));
router.get('/:contestId/leaderboard', authMiddleware, userContestController.getLeaderboard.bind(userContestController));


router.get('/state/:state', authMiddleware(), (req, res) => userContestController.getActiveContests(req, res));
// router.get('/contests/upcoming', authMiddleware, userContestController.getUpcomingContests.bind(userContestController));
// router.get('/contests/past', authMiddleware, userContestController.getPastContests.bind(userContestController));




export default router;


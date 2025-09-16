

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
import { GetContestDetailUseCase } from '../../../application/usecases/contests/GetContestDetailUseCase';
import { MongoTestCaseRepository } from '../../../infrastructure/db/MongoTestCaseRepository';
import { SubmitContestSolutionUseCase } from '../../../application/usecases/contests/SubmitContestSolutionUseCase';
import { MongoSubmissionRepository } from '../../../infrastructure/db/MongoSubmissionRepository';
import { CreateSubmissionUseCase } from '../../../application/usecases/submissions/CreateSubmissionUseCase';
import { ContestScoringService } from '../../../application/services/ContestScoringService';
import { Judge0Service } from '../../../infrastructure/services/Judge0Service';
import { CodeExecutionHelperService } from '../../../application/services/CodeExecutionHelperService';



const router = Router();

const contestRepository = new MongoContestRepository()
const participantRepository = new MongoContestParticipantRepository()
const problemRepository = new MongoProblemRepository()
const testCaseRepository = new MongoTestCaseRepository()
const submissionRepository = new MongoSubmissionRepository()
const scoringService = new ContestScoringService()
const timerService = new ContestTimerService(contestRepository)
const userRepository = new MongoUserRepository()
const judge0Service = new Judge0Service()
const codeExecutionHelperService = new CodeExecutionHelperService(judge0Service)
const createSubmissionUseCase = new CreateSubmissionUseCase(judge0Service, submissionRepository, problemRepository, testCaseRepository, codeExecutionHelperService)
const registerForContestUseCase = new RegisterForContestUseCase(contestRepository, participantRepository, problemRepository)
const submitContestSolutionUseCase = new SubmitContestSolutionUseCase(contestRepository, participantRepository, submissionRepository, createSubmissionUseCase, scoringService, timerService)
const getContestsListUseCase = new GetContestsListUseCase(contestRepository)
const getContestDetailUseCase = new GetContestDetailUseCase(contestRepository, participantRepository)
const startContestProblemUseCase = new StartContestProblemUseCase(contestRepository, participantRepository, problemRepository, timerService, testCaseRepository)
const getContestLeaderboardUseCase = new GetContestLeaderboardUseCase(contestRepository, participantRepository, userRepository)
const userContestController = new UserContestController(registerForContestUseCase, startContestProblemUseCase, getContestLeaderboardUseCase, getContestsListUseCase, getContestDetailUseCase, submitContestSolutionUseCase)




router.get('/:contestNumber', authMiddleware(), (req, res) => userContestController.getContestDetail(req, res));

router.post('/register', authMiddleware(), (req, res) => userContestController.registerForContest(req, res));

router.get('/:contestNumber/start', authMiddleware(), (req, res) => userContestController.startContestProblem(req, res));

router.post('/submit-solution', authMiddleware(), (req, res) => userContestController.submitSolution(req, res));

router.get('/:contestId/leaderboard', authMiddleware, userContestController.getLeaderboard.bind(userContestController));

router.get('/state/:state', authMiddleware(), (req, res) => userContestController.getActiveContests(req, res));



export default router;


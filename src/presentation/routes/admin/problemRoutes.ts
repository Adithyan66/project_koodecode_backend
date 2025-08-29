import { Router } from 'express';
// import { UserProblemController } from '../..***REMOVED***ontroller';
import { AdminProblemController } from '../..***REMOVED***Controller';
import { authMiddleware } from '../../middleware/authMiddleware';

import { GetProblemsListUseCase } from '../../..***REMOVED***msListUseCase';
import { GetProblemByIdUseCase } from '../../..***REMOVED***mByIdUseCase';
import { CreateProblemUseCase } from '../../..***REMOVED***blemUseCase';

import { MongoProblemRepository } from '../../..***REMOVED***y';

const router = Router();

const problemRepository = new MongoProblemRepository();


const getProblemsListUseCase = new GetProblemsListUseCase(problemRepository);
const getProblemByIdUseCase = new GetProblemByIdUseCase(problemRepository);
const createProblemUseCase = new CreateProblemUseCase(problemRepository);

// const userProblemController = new UserProblemController(
    // getProblemsListUseCase,
    // getProblemByIdUseCase
// );

const adminProblemController = new AdminProblemController(createProblemUseCase);

// router.get('/problems', userProblemController.getProblems.bind(userProblemController));
// router.get('/problems/:id', userProblemController.getProblemById.bind(userProblemController));


router.post('/create-problem', authMiddleware("admin"), adminProblemController.createProblem.bind(adminProblemController));


export default router;

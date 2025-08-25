import { Router } from 'express';
import { UserProblemController } from '..***REMOVED***ler';
import { AdminProblemController } from '..***REMOVED***ller';
import { authMiddleware } from '../middleware/authMiddleware';

import { GetProblemsListUseCase } from '../..***REMOVED***msListUseCase';
import { GetProblemByIdUseCase } from '../..***REMOVED***mByIdUseCase';
import { CreateProblemUseCase } from '../..***REMOVED***blemUseCase';

import { MongoProblemRepository } from '../..***REMOVED***y';

const router = Router();

const problemRepository = new MongoProblemRepository();

// Initialize use cases
const getProblemsListUseCase = new GetProblemsListUseCase(problemRepository);
const getProblemByIdUseCase = new GetProblemByIdUseCase(problemRepository);
const createProblemUseCase = new CreateProblemUseCase(problemRepository);

const userProblemController = new UserProblemController(
    getProblemsListUseCase,
    getProblemByIdUseCase
);

const adminProblemController = new AdminProblemController(createProblemUseCase);

router.get('/problems', userProblemController.getProblems.bind(userProblemController));
router.get('/problems/:id', userProblemController.getProblemById.bind(userProblemController));


router.post('/admin/problems', authMiddleware("admin"), adminProblemController.createProblem.bind(adminProblemController));
// router.post('/admin/problems',  adminProblemController.createProblem.bind(adminProblemController));

export default router;

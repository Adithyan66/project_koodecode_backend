import { Router } from 'express';
// import { UserProblemController } from '../../controllers/admin/problems/UserProblemController';
import { AdminProblemController } from '../../controllers/admin/problems/AdminProblemController';
import { authMiddleware } from '../../middleware/authMiddleware';

import { GetProblemsListUseCase } from '../../../application/usecases/problems/GetProblemsListUseCase';
import { GetProblemByIdUseCase } from '../../../application/usecases/problems/GetProblemByIdUseCase';
import { CreateProblemUseCase } from '../../../application/usecases/problems/CreateProblemUseCase';

import { MongoProblemRepository } from '../../../infrastructure/db/MongoProblemRepository';
import { MongoCounterRepository } from '../../../infrastructure/db/MongoCounterRepository';
import { MongoTestCaseRepository } from '../../../infrastructure/db/MongoTestCaseRepository';

const router = Router();

const problemRepository = new MongoProblemRepository();
const counterRepository = new MongoCounterRepository();
const testCaseRepository = new MongoTestCaseRepository()


const getProblemsListUseCase = new GetProblemsListUseCase(problemRepository);
const getProblemByIdUseCase = new GetProblemByIdUseCase(problemRepository, testCaseRepository);
const createProblemUseCase = new CreateProblemUseCase(problemRepository, testCaseRepository, counterRepository);

// const userProblemController = new UserProblemController(
// getProblemsListUseCase,
// getProblemByIdUseCase
// );

const adminProblemController = new AdminProblemController(createProblemUseCase);

// router.get('/problems', userProblemController.getProblems.bind(userProblemController));
// router.get('/problems/:id', userProblemController.getProblemById.bind(userProblemController));


router.post('/create-problem', authMiddleware("admin"), adminProblemController.createProblem.bind(adminProblemController));


export default router;

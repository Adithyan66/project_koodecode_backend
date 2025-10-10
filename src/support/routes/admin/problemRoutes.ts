import { Router } from 'express';

// import { UserProblemController } from '../../controllers/users/problems/UserProblemController';
import { AdminProblemController } from '../../../support/controllers/admin/problems/AdminProblemController';
import { authMiddleware } from '../../../support/middleware/authMiddleware';

import { GetProblemsListUseCase } from '../../../application/usecases/problems/GetProblemsListUseCase';
import { GetProblemByIdUseCase } from '../../../application/usecases/problems/GetProblemByIdUseCase';
import { CreateProblemUseCase } from '../../../application/usecases/problems/CreateProblemUseCase';

import { MongoProblemRepository } from '../../../infrastructure/db/MongoProblemRepository';
import { MongoCounterRepository } from '../../../infrastructure/db/MongoCounterRepository';
import { MongoTestCaseRepository } from '../../../infrastructure/db/MongoTestCaseRepository';
import { GetProblemNamesUseCase } from '../../../application/usecases/problems/GetProblemNamesUseCase';

const router = Router();

const problemRepository = new MongoProblemRepository();
const counterRepository = new MongoCounterRepository();
const testCaseRepository = new MongoTestCaseRepository()


const getProblemsListUseCase = new GetProblemsListUseCase(problemRepository);
const getProblemByIdUseCase = new GetProblemByIdUseCase(problemRepository, testCaseRepository);
const createProblemUseCase = new CreateProblemUseCase(problemRepository, testCaseRepository, counterRepository);
const getProblemNameUseCase = new GetProblemNamesUseCase(problemRepository)

// const userProblemController = new UserProblemController(
// getProblemsListUseCase,
// getProblemByIdUseCase
// );

const adminProblemController = new AdminProblemController(createProblemUseCase, getProblemNameUseCase);

// router.get('/problems', userProblemController.getProblems.bind(userProblemController));
// router.get('/problems/:id', userProblemController.getProblemById.bind(userProblemController));


router.post('/create-problem', authMiddleware("admin"), adminProblemController.createProblem.bind(adminProblemController));
router.get('/problem-names', authMiddleware("admin"), adminProblemController.getProblemNames.bind(adminProblemController));


export default router;

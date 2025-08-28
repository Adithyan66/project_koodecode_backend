import { Router } from 'express';
import { UserProblemController } from '../../controllers/problems/UserProblemController';
import { AdminProblemController } from '../../controllers/problems/AdminProblemController';
import { authMiddleware } from '../../middleware/authMiddleware';

import { GetProblemsListUseCase } from '../../../application/usecases/problems/GetProblemsListUseCase';
import { GetProblemByIdUseCase } from '../../../application/usecases/problems/GetProblemByIdUseCase';
import { CreateProblemUseCase } from '../../../application/usecases/problems/CreateProblemUseCase';

import { MongoProblemRepository } from '../../../infrastructure/db/MongoProblemRepository';

const router = Router();

const problemRepository = new MongoProblemRepository();


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


export default router;

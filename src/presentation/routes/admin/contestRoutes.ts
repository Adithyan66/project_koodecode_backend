

import { Router } from 'express';
import { AdminContestController } from '../../controllers/admin/contests/AdminContestController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { CreateContestUseCase } from '../../../application/usecases/contests/CreateContestUseCase';
import { MongoCounterRepository } from '../../../infrastructure/db/MongoCounterRepository';
import { MongoProblemRepository } from '../../../infrastructure/db/MongoProblemRepository';
import { MongoContestRepository } from '../../../infrastructure/db/MongoContestRepository';

const router = Router();



const contestRepository = new MongoContestRepository()
const problemRepository = new MongoProblemRepository()
const counterRepository = new MongoCounterRepository()


const createContestUseCase = new CreateContestUseCase(contestRepository, counterRepository, problemRepository)

const adminContestController = new AdminContestController(createContestUseCase)

router.post('/create', authMiddleware(), (req, res) => adminContestController.createContest(req, res));

export default router;






import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { authMiddleware } from '../../../../support/middleware/authMiddleware';
import { container } from "../../../../infrastructure/config/container";
import { UserProblemController } from '../../../http/controllers/user/UserProblemController';



const router = Router();
const userProblemController = container.resolve(UserProblemController);


router.get("/get-problems", authMiddleware(), expressAdapter(userProblemController.getProblemsWithFilters))

router.get('/:slug/detail', authMiddleware(), expressAdapter(userProblemController.getProblemDetail));

router.post('/test-case', authMiddleware(), expressAdapter(userProblemController.runTestCase))

router.post('/submit', authMiddleware(), expressAdapter(userProblemController.submitSolution));

router.get('/submissions/:submissionId', expressAdapter(userProblemController.getSubmissionResult));

router.get('/languages', expressAdapter(userProblemController.getLanguages));

router.get('/problem-names', authMiddleware(), expressAdapter(userProblemController.getProblemNames));


export default router;


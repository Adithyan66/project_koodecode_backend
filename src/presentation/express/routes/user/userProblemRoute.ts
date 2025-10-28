




import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { UserProblemController } from '../../../http/controllers/user/UserProblemController';
import { authenticate } from '../../middlewares';



const router = Router();
const userProblemController = container.resolve(UserProblemController);


router.get("/get-problems", authenticate, expressAdapter(userProblemController.getProblemsWithFilters))
router.get('/problem-names', authenticate, expressAdapter(userProblemController.getProblemNames));
router.get('/list-page-data', authenticate, expressAdapter(userProblemController.getListPageData))
router.get('/:slug/detail', authenticate, expressAdapter(userProblemController.getProblemDetail));
router.post('/test-case', authenticate, expressAdapter(userProblemController.runTestCase))
router.post('/submit', authenticate, expressAdapter(userProblemController.submitSolution));
router.get('/submissions/:submissionId', expressAdapter(userProblemController.getSubmissionResult));
router.get('/languages', expressAdapter(userProblemController.getLanguages));
// router.patch('/problem-like',authenticate ,expressAdapter(userProblemController.likeProblem))

export default router;

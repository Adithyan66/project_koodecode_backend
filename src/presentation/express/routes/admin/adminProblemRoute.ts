

import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminProblemController } from '../../../http/controllers/admin/AdminProblemController';
import { adminOnly } from '../../middlewares';

const router = Router();
const adminProblemController = container.resolve(AdminProblemController);

router.post('/create-problem', adminOnly, expressAdapter(adminProblemController.createProblem));
router.get('/', adminOnly, expressAdapter(adminProblemController.getAllProblems));
router.get('/get-languages', expressAdapter(adminProblemController.getAllLanguages));
router.get('/:slug', adminOnly, expressAdapter(adminProblemController.getProblemDetail));
router.get('/:slug/testcases', adminOnly, expressAdapter(adminProblemController.getProblemTestCases));
router.put('/:slug', adminOnly, expressAdapter(adminProblemController.updateProblem));
router.put('/:slug/testcases/:testCaseId', adminOnly, expressAdapter(adminProblemController.updateTestCase));
router.post('/:slug/testcases', adminOnly, expressAdapter(adminProblemController.addTestCase));

export default router;
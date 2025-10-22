

import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminProblemController } from '../../../http/controllers/admin/AdminProblemController';
import { adminOnly } from '../../middlewares';



const router = Router();
const adminProblemController = container.resolve(AdminProblemController);

router.post('/create-problem', adminOnly, expressAdapter(adminProblemController.createProblem));
router.get('/', adminOnly, expressAdapter(adminProblemController.getAllProblems));
router.get('/get-languages', expressAdapter(adminProblemController.getAllLanguages))
router.get('/:problemId', adminOnly, expressAdapter(adminProblemController.getProblemDetail));

export default router;

// router.get('/problem-names', authMiddleware("admin"), adminProblemController.getProblemNames.bind(adminProblemController));
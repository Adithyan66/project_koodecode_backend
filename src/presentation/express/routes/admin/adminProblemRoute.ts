

import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { authMiddleware } from '../../../../support/middleware/authMiddleware';
import { container } from "../../../../infrastructure/config/container";
import { AdminProblemController } from '../../../http/controllers/admin/AdminProblemController';



const router = Router();
const adminProblemController = container.resolve(AdminProblemController);

router.post('/create-problem', authMiddleware("admin"), expressAdapter(adminProblemController.createProblem));
// router.get('/problem-names', authMiddleware("admin"), adminProblemController.getProblemNames.bind(adminProblemController));


export default router;

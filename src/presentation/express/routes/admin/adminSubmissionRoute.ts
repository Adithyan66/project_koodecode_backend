import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminSubmissionController } from '../../../http/controllers/admin/AdminSubmissionController';
import { adminOnly } from '../../middlewares';

const router = Router();
const adminSubmissionController = container.resolve(AdminSubmissionController);

router.get('/', adminOnly, expressAdapter(adminSubmissionController.getAllSubmissions));
router.get('/:submissionId', adminOnly, expressAdapter(adminSubmissionController.getSubmissionDetail));

export default router;


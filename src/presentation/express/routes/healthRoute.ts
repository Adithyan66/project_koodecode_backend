



import { Router } from 'express';
import { HealthController } from '../../http/controllers/shared/HealthController';
import { container } from 'tsyringe';
import { expressAdapter } from '../../adaptors/ExpressAdaptor';


const router = Router();


const healthController = container.resolve(HealthController)

router.get('/judge0', expressAdapter(healthController.checkJudge0Health));
router.get('/system', expressAdapter(healthController.getSystemHealth));

export default router;

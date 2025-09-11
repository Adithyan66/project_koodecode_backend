

import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
import { Judge0HealthService } from '../../infrastructure/services/Judge0HealthService'; 

const router = Router();

const judge0HealthService = new Judge0HealthService();
const healthController = new HealthController(judge0HealthService);

router.get('/judge0', healthController.checkJudge0Health.bind(healthController));
router.get('/system', healthController.getSystemHealth.bind(healthController));

export default router;

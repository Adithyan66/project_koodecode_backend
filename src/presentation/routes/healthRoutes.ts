

import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
<<<<<<< HEAD
import { Judge0HealthService } from '../../infrastructure/services/Judge0HealthService'; 
=======
import { Judge0HealthService } from '../../infrastructure/services/Judge0HealthService';
>>>>>>> feature/s3-bucket

const router = Router();

const judge0HealthService = new Judge0HealthService();
const healthController = new HealthController(judge0HealthService);

router.get('/judge0', healthController.checkJudge0Health.bind(healthController));
router.get('/system', healthController.getSystemHealth.bind(healthController));

export default router;

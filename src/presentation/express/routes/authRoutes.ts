

import { Router } from 'express';
import { expressAdapter } from '../../adaptors/ExpressAdaptor';
import { container } from "../../../infrastructure/config/container";
import { AuthController } from '../../http/controllers/authentication/AuthController';
import { userOnly } from '../middlewares';



const router = Router();
const authControllers = container.resolve(AuthController);






router.post('/signup/request-otp', expressAdapter(authControllers.requestOtp));
router.post('/signup/verify-otp', expressAdapter(authControllers.verifyOtpAndSignup));
router.post('/login', expressAdapter(authControllers.login));
router.get('/validate', expressAdapter(authControllers.validateUser));
router.get('/refresh-token', expressAdapter(authControllers.verifyToken));
router.post('/logout', expressAdapter(authControllers.logoutUser));
router.post('/forgot/request-otp', expressAdapter(authControllers.forgotRequestOtp))
router.post('/verify-otp', expressAdapter(authControllers.verifyOtp))
router.post('/forgot/change-password', expressAdapter(authControllers.forgotChangePassword))
router.post('/google/callback', expressAdapter(authControllers.googleLogin))
router.post('/github/callback', expressAdapter(authControllers.githubLogin))
router.patch('/change-password', userOnly, expressAdapter(authControllers.changePassword))


export default router;


import { Router } from 'express';
import { expressAdapter } from '../../adaptors/ExpressAdaptor';
import { authMiddleware } from '../../../support/middleware/authMiddleware';
import { container } from "../../../infrastructure/config/container";
import { AuthController } from '../../http/controllers/authentication/AuthController';



const router = Router();
const authControllers = container.resolve(AuthController);

router.post('/signup/request-otp', expressAdapter(authControllers.requestOtp));

router.post('/signup/verify-otp', expressAdapter(authControllers.verifyOtpAndSignup));

router.post('/login', expressAdapter(authControllers.login));

router.get('/validate', expressAdapter(authControllers.validateUser));

router.get('/refresh-token', expressAdapter(authControllers.verifyToken));

router.post('/logout', expressAdapter(authControllers.logoutUser))

router.post('/forgot/request-otp', expressAdapter(authControllers.forgotRequestOtp))

router.post('/verify-otp', expressAdapter(authControllers.verifyOtp))

router.post('/forgot/change-password', expressAdapter(authControllers.forgotChangePassword))

router.post('/google/callback', expressAdapter(authControllers.googleLogin))

router.post('/github/callback', expressAdapter(authControllers.githubLogin))

router.patch('/change-password', authMiddleware(), expressAdapter(authControllers.changePassword))


export default router;




// router.post('/signup/request-otp', (req, res) => signupController.requestOtp(req, res));
// router.post('/signup/verify-otp', (req, res) => signupController.verifyOtpAndSignup(req, res));
// router.post('/login', (req, res) => loginController.login(req, res));
// router.get('/validate', (req, res) => userController.validateUser(req, res));
// router.get('/refresh-token', (req, res) => refreshTokenController.verifyToken(req, res));
// router.post('/logout', (req, res) => logoutController.logoutUser(req, res))
// router.post('/forgot/request-otp', (req, res) => forgotPasswordController.requestOtp(req, res))
// router.post('/verify-otp', (req, res) => forgotPasswordController.verifyOtp(req, res))
// router.post('/forgot/change-password', (req, res) => forgotPasswordController.changePassword(req, res))
// router.post('/google/callback', (req, res) => oauthController.googleLogin(req, res));
// router.post('/github/callback', oauthController.githubLogin.bind(oauthController));
// router.patch('/change-password', authMiddleware(), (req, res) => changePasswordController.changePassword(req, res))
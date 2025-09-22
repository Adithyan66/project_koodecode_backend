import { Router } from 'express';
import { SignupController } from '../controllers/auth/SignupController';
import { LoginController } from '../controllers/auth/LoginController';
import { JwtService } from '../../infrastructure/services/JwtService';
import { OAuthController } from '../controllers/auth/OAuthController';
import { LoginUseCase } from '../../application/usecases/users/LoginUseCase';
import { MongoUserRepository } from '../../infrastructure/db/MongoUserRepository';
import { SignupUseCase } from '../../application/usecases/users/SignupUseCase';
import { OtpUseCase } from '../../application/usecases/users/OtpUseCase';
import { RedisOtpRepository } from '../../infrastructure/persistence/RedisOtpRepository';
import { NodemailerEmailService } from '../../infrastructure/services/NodemailerEmailService';
import { ValidateUserUseCase } from '../../application/usecases/users/ValidateUserUseCase';
import { UserController } from '../controllers/auth/UserController';
import { LogoutController } from '../controllers/auth/LogoutController';
import { RefreshTokenController } from '../controllers/auth/RefreshTokenController';
import { ForgotPasswordController } from '../controllers/auth/ForgotPasswordController';
import { ForgotPasswordUseCase } from '../../application/usecases/users/ForgotPasswordUseCase';
import { GoogleOAuthUseCase } from '../../application/usecases/users/GoogleOAuthUseCase';
import { GitHubOAuthUseCase } from '../../application/usecases/users/GitHubOAuthUseCase';
import { OAuthService } from '../../infrastructure/services/OAuthService';
import { PasswordService } from '../../application/services/PasswordService';
import { ChangePasswordController } from '../controllers/auth/ChangePasswordController';
import { ChangePasswordUseCase } from '../../application/usecases/auth/ChangePasswordUseCase';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const userRepository = new MongoUserRepository();
const jwtService = new JwtService();
const redisOtpService = new RedisOtpRepository()
const nodeMailerService = new NodemailerEmailService()
const otpService = new OtpUseCase(redisOtpService, nodeMailerService);
const authServive = new OAuthService()
const passwordService = new PasswordService()

const signupUseCase = new SignupUseCase(userRepository, otpService, jwtService);
const loginUseCase = new LoginUseCase(userRepository, jwtService, passwordService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, otpService, jwtService, passwordService)

const googleOAuthUseCase = new GoogleOAuthUseCase(userRepository, authServive, jwtService)
const githubOAuthUseCase = new GitHubOAuthUseCase(userRepository, authServive, jwtService)
const oauthController = new OAuthController(googleOAuthUseCase, githubOAuthUseCase);

const forgotPasswordController = new ForgotPasswordController(forgotPasswordUseCase)
const signupController = new SignupController(signupUseCase, jwtService);
const loginController = new LoginController(loginUseCase);

const validateUserUseCase = new ValidateUserUseCase(userRepository, jwtService)
const userController = new UserController(validateUserUseCase)

const logoutController = new LogoutController()

const refreshTokenController = new RefreshTokenController(jwtService)

const changePasswordUseCase = new ChangePasswordUseCase(userRepository, passwordService)

const changePasswordController = new ChangePasswordController(changePasswordUseCase)

router.post('/signup/request-otp', (req, res) => signupController.requestOtp(req, res));

router.post('/signup/verify-otp', (req, res) => signupController.verifyOtpAndSignup(req, res));

router.post('/login', (req, res) => loginController.login(req, res));

router.get('/validate', (req, res) => userController.validateUser(req, res));

router.get('/refresh-token', (req, res) => refreshTokenController.verifyToken(req, res));

router.post('/logout', (req, res) => logoutController.logoutUser(req, res))

router.post('/forgot/request-otp', (req, res) => forgotPasswordController.requestOtp(req, res))

router.post('/verify-otp', (req, res) => forgotPasswordController.verifyOtp(req, res))

router.post('/forgot/change-password', (req, res) => forgotPasswordController.changePassword(req, res))

router.post('/google/callback', (req, res) => oauthController.googleLogin(req, res));

router.post('/github/callback', oauthController.githubLogin.bind(oauthController));

router.patch('/change-password', authMiddleware(), (req, res) => changePasswordController.changePassword(req, res))



export default router;






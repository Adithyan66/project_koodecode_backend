import { Router } from 'express';
import { SignupController } from '../../support/controllers/auth/SignupController';
import { LoginController } from '../../support/controllers/auth/LoginController';
import { JwtService } from '../../infrastructure/services/JwtService';
import { OAuthController } from '../../support/controllers/auth/OAuthController';
import { LoginUseCase } from '../../application/usecases/auth/LoginUseCase';
import { MongoUserRepository } from '../../infrastructure/db/MongoUserRepository';
import { SignupUseCase } from '../../application/usecases/auth/SignupUseCase';
import { OtpUseCase } from '../../application/usecases/auth/OtpUseCase';
import { RedisOtpRepository } from '../../infrastructure/persistence/RedisOtpRepository';
import { NodemailerEmailService } from '../../infrastructure/services/NodemailerEmailService';
import { ValidateUserUseCase } from '../../application/usecases/auth/ValidateUserUseCase';
import { UserController } from '../../support/controllers/auth/UserController';
import { LogoutController } from '../../support/controllers/auth/LogoutController';
import { RefreshTokenController } from '../../support/controllers/auth/RefreshTokenController';
import { ForgotPasswordController } from '../../support/controllers/auth/ForgotPasswordController';
import { ForgotPasswordUseCase } from '../../application/usecases/auth/ForgotPasswordUseCase';
import { GoogleOAuthUseCase } from '../../application/usecases/auth/GoogleOAuthUseCase';
import { GitHubOAuthUseCase } from '../../application/usecases/auth/GitHubOAuthUseCase';
import { OAuthService } from '../../infrastructure/services/OAuthService';
import { PasswordService } from '../../application/services/PasswordService';
import { ChangePasswordController } from '../../support/controllers/auth/ChangePasswordController';
import { ChangePasswordUseCase } from '../../application/usecases/auth/ChangePasswordUseCase';
import { authMiddleware } from '../../support/middleware/authMiddleware';
import { UsernameService } from '../../infrastructure/services/UsernameService';

const router = Router();

const userRepository = new MongoUserRepository();
const redisOtpService = new RedisOtpRepository()
const nodeMailerService = new NodemailerEmailService()
const otpService = new OtpUseCase(redisOtpService, nodeMailerService);
const jwtService = new JwtService();
const passwordService = new PasswordService()

const authServive = new OAuthService()

const signupUseCase = new SignupUseCase(userRepository, otpService, jwtService, passwordService);
const loginUseCase = new LoginUseCase(userRepository, jwtService, passwordService);
const forgotPasswordUseCase = new ForgotPasswordUseCase(userRepository, otpService, jwtService, passwordService)

const googleOAuthUseCase = new GoogleOAuthUseCase(userRepository, authServive, jwtService, new UsernameService())
const githubOAuthUseCase = new GitHubOAuthUseCase(userRepository, authServive, jwtService,new UsernameService())
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






import { Router } from 'express';
import { SignupController } from '../controllers/auth/SignupController';
import { LoginController } from '../controllers/auth/LoginController';
import { JwtService } from '../../infrastructure/services/JwtService';
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

const router = Router();

const userRepository = new MongoUserRepository();
const jwtService = new JwtService();
const redisOtpService = new RedisOtpRepository()
const nodeMailerService = new NodemailerEmailService()
const otpService = new OtpUseCase(redisOtpService, nodeMailerService);

const signupUseCase = new SignupUseCase(userRepository, otpService, jwtService);
const loginUseCase = new LoginUseCase(userRepository, jwtService);

const signupController = new SignupController(signupUseCase, jwtService);
const loginController = new LoginController(loginUseCase);

const validateUserUseCase = new ValidateUserUseCase(userRepository, jwtService)
const userController = new UserController(validateUserUseCase)

const logoutController = new LogoutController()

const refreshTokenController = new RefreshTokenController(jwtService)

router.post('/signup/request-otp', (req, res) => signupController.requestOtp(req, res));

router.post('/signup/verify-otp', (req, res) => signupController.verifyOtpAndSignup(req, res));

router.post('/login', (req, res) => loginController.login(req, res));

router.get('/validate', (req, res) => userController.validateUser(req, res));

router.get('/refresh-token', (req, res) => refreshTokenController.verifyToken(req, res));

router.post("/logout", (req, res) => logoutController.logoutUser(req, res))

router.post('forgot/request-otp', (req, res) => forgotController.requestOtp(req, res))

router.post('forgot/verify-otp', (req, res) => forgotController.requestOtp(req, res))

router.post('forgot/change-password', (req, res) => forgotController.requestOtp(req, res))



export default router;






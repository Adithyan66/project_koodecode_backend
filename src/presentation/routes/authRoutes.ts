import { Router } from 'express';
import { SignupController } from '../controllers/SignupController';
import { LoginController } from '../controllers/LoginController';
import { JwtService } from '../../infrastructure/services/JwtService';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { MongoUserRepository } from '../../infrastructure/db/MongoUserRepository';
import { SignupUseCase } from '../../application/usecases/SignupUseCase';
import { OtpUseCase } from '../../application/usecases/OtpUseCase';
import { RedisOtpRepository } from '../..***REMOVED***sitory';
import { NodemailerEmailService } from '../..***REMOVED***Service';
import { ValidateUserUseCase } from '../..***REMOVED***e';
import { UserController } from '../controllers/UserController';
import { LogoutController } from '../controllers/LogoutController';

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

router.post('/signup/request-otp', (req, res) => signupController.requestOtp(req, res));
router.post('/signup/verify-otp', (req, res) => signupController.verifyOtpAndSignup(req, res));

router.post('/login', (req, res) => loginController.login(req, res));

router.get('/validate', (req, res) => userController.validateUser(req, res));

router.post("/logout", (req, res) => logoutController.logoutUser(req, res))


export default router;






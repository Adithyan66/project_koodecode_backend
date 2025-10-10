import { LoginUseCase } from "../../../application/usecases/users/LoginUseCase";
import { OtpUseCase } from "../../../application/usecases/users/OtpUseCase";
import { SignupUseCase } from "../../../application/usecases/users/SignupUseCase";
import { ValidateUserUseCase } from "../../../application/usecases/users/ValidateUserUseCase";
import { AuthController } from "../../http/controllers/authentication/AuthController";

import { jwtService, passwordService, nodeMailerService } from "../shared/providers";
import { userRepository, redisOtpService } from "../shared/repositories";



const loginUseCase = new LoginUseCase(userRepository, jwtService, passwordService)
const validateUserUseCase = new ValidateUserUseCase(userRepository, jwtService)

const otpService = new OtpUseCase(redisOtpService, nodeMailerService);




const signupUseCase = new SignupUseCase(userRepository, otpService, jwtService, passwordService)


console.log('loginUseCase:', loginUseCase);
console.log('signupUseCase:', signupUseCase);  
console.log('validateUserUseCase:', validateUserUseCase);


console.log('userRepository:', userRepository);
console.log('jwtService:', jwtService);
console.log('passwordService:', passwordService);
console.log('redisOtpService:', redisOtpService);
console.log('nodeMailerService:', nodeMailerService);

export const authControllers = new AuthController(signupUseCase, loginUseCase, validateUserUseCase);

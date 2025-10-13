


import { injectable,inject } from "tsyringe";
import { IAuthController } from "../../interfaces/IAuthController";
import { IHttpRequest } from "../../interfaces/IHttpRequest";
import { HttpResponse } from "../../helper/HttpResponse";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { BadRequestError } from "../../../../application/errors/AppErrors";
import { IChangePasswordUseCase, IForgotPasswordUseCase, IGitHubOAuthUseCase, IGoogleOAuthUseCase, ILoginUseCase, ISignupUseCase, IValidateUserUseCase } from "../../../../application/interfaces/IAuthenticationUseCase";
import { AppError } from "../../../../application/errors/AppError";
import { TokenPayload } from "../../../../shared/types/TokenPayload";
import { ITokenService } from "../../../../domain/interfaces/services/ITokenService";



@injectable()
export class AuthController implements IAuthController {

  constructor(
    @inject("ISignupUseCase") private _signupUseCase: ISignupUseCase,
    @inject("ILoginUseCase") private _loginUseCase: ILoginUseCase,
    @inject("IValidateUserUseCase") private _validateUserUseCase: IValidateUserUseCase,
    @inject("ITokenService") private _tokenService: ITokenService,
    @inject("IForgotPasswordUseCase") private _forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject("IGoogleOAuthUseCase") private _googleOAuthUseCase: IGoogleOAuthUseCase,
    @inject("IGitHubOAuthUseCase") private _githubOAuthUseCase: IGitHubOAuthUseCase,
    @inject("IChangePasswordUseCase") private _changePasswordUseCase: IChangePasswordUseCase
  ) {}


    requestOtp = async (httpRequest: IHttpRequest) => {

        if (!httpRequest.body?.email || !httpRequest.body?.userName || !httpRequest.body?.fullName) {
            throw new BadRequestError('Missing required fields');
        }

        const { fullName, userName, email } = httpRequest.body;

        const result = await this._signupUseCase.otpRequestExecute(fullName, userName, email)

        return new HttpResponse(HTTP_STATUS.OK, { ...buildResponse(true, 'otp sent succesfully', result) })
    }

    verifyOtpAndSignup = async (httpRequest: IHttpRequest) => {

        if (!httpRequest.body?.email || !httpRequest.body?.otp || !httpRequest.body?.password) {
            throw new BadRequestError('Missing required fields');
        }

        const { email, otp, password } = httpRequest.body;

        const { user } = await this._signupUseCase.verifyOtpAndSignupExecute(email, otp, password)

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'User login successful', { user }),
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        });
    }

    login = async (httpRequest: IHttpRequest) => {

        const { email, password } = httpRequest.body;

        const { user } = await this._loginUseCase.execute(email, password);
        
        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'User login successful', { user }),
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        });
    }

    validateUser = async (httpRequest: IHttpRequest) => {

        const authHeader = httpRequest.headers.authorization;

        if (!authHeader) {
            throw new BadRequestError("Authorization header is required");
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;

        if (!token) {
            throw new BadRequestError("Token is required");
        }

        const result = await this._validateUserUseCase.execute(token);

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, result.message, result.user));
    }

    verifyToken = async (httpRequest: IHttpRequest) => {

        console.log("tokennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn",httpRequest.cookies.refreshToken);
        const token = httpRequest.cookies.refreshToken

        if (!token) {
            throw new BadRequestError("token is required");
        }

        const data: TokenPayload | null = this._tokenService.verifyRefreshToken(token)

        if (!data) {
            throw new BadRequestError("Invalid or expired refresh token");
        }

        const payload = {
            userId: data.userId,
            role: data.role
        };

        const newAccessToken = this._tokenService.generateAccessToken(payload);

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, "acces token created succesfully", { accessToken: newAccessToken }));

    }

    logoutUser = async () => {

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, "Logged out", { clearCookies: true }));

    }

    forgotRequestOtp = async (httpRequest: IHttpRequest) => {

        const { email } = httpRequest.body;

        if (!email) {
            throw new BadRequestError("email is required");
        }

        const data = await this._forgotPasswordUseCase.otpRequestExecute(email)

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, data.message));

    }

    verifyOtp = async (httpRequest: IHttpRequest) => {

        const { email, otp } = httpRequest.body

        if (!email || !otp) {
            throw new BadRequestError("email and otp required");
        }

        let response = await this._forgotPasswordUseCase.verifyOtp(email, otp)

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, response.message));
    }

    forgotChangePassword = async (httpRequest: IHttpRequest) => {

        const { email, otp, password } = httpRequest.body

        if (!email || !otp || !password) {
            throw new BadRequestError("email , otp , password required");
        }

        let { user } = await this._forgotPasswordUseCase.changePAsswordExecute(email, otp, password)
  

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'password chnages successful', { user }),
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        });
    }

    googleLogin = async (httpRequest: IHttpRequest) => {

        const { token } = httpRequest.body;

        if (!token) {
            throw new BadRequestError("Google token is required");
        }

        const { user } = await this._googleOAuthUseCase.execute(token);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'User login successful', { user }),
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        });
    }

    githubLogin = async (httpRequest: IHttpRequest) => {

        const { code } = httpRequest.body;

        if (!code) {
            throw new BadRequestError("GitHub code is required");
        }

        const { user } = await this._githubOAuthUseCase.execute(code);

        return new HttpResponse(HTTP_STATUS.OK, {
            ...buildResponse(true, 'User login successful', { user }),
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
        });

    }

    changePassword = async (httpRequest: IHttpRequest) => {

        const { password, newPassword } = httpRequest.body

        const userId = httpRequest.user?.userId

        if (!password || !newPassword || !userId) {
            throw new BadRequestError("All Fields required");
        }

        await this._changePasswordUseCase.execute(userId, password, newPassword)

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, "password changed succesfully"));

    }


}




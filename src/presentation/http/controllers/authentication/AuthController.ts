


import { IAuthController } from "../../interfaces/IAuthController";
import { IHttpRequest } from "../../interfaces/IHttpRequest";
import { HttpResponse } from "../../helper/HttpResponse";
import { HTTP_STATUS } from "../../../../shared/constants/httpStatus";
import { buildResponse } from "../../../../infrastructure/utils/responseBuilder";
import { BadRequestError } from "../../../../application/errors/AppErrors";
import { ILoginUseCase, ISignupUseCase, IValidateUserUseCase } from "../../../../application/interfaces/IAuthenticationUseCase";
import { AppError } from "../../../../application/errors/AppError";




export class AuthController implements IAuthController {

    constructor(
        private _signupUseCase: ISignupUseCase,
        private _loginUseCase: ILoginUseCase,
        private _validateUserUseCase: IValidateUserUseCase
    ) { }


    requestOtp = async (httpRequest: IHttpRequest) => {



        if (!httpRequest.body?.email || !httpRequest.body?.userName || !httpRequest.body?.fullName) {
            throw new BadRequestError('Missing required fields');
        }

        console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",);
        const { fullName, userName, email } = httpRequest.body;

        const result = await this._signupUseCase.otpRequestExecute(fullName, userName, email)

        return new HttpResponse(HTTP_STATUS.OK, { ...buildResponse(true, 'otp sent succesfully', result) })
    }

    verifyOtpAndSignup = async (httpRequest: IHttpRequest) => {

        if (!httpRequest.body?.email || !httpRequest.body?.otp || httpRequest.body?.password) {
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

        // res.cookie("refreshToken", user.refreshToken, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: "strict",
        //     path: "/",
        //     maxAge: config.cookieMaxAge
        // });


        // res.status(200).json({
        //     success: true,
        //     message: "User loged successfully",
        //     user: {
        //         id: user.id,
        //         fullName: user.fullName,
        //         userName: user.userName,
        //         email: user.email,
        //         profilePicUrl: user.profilePicUrl,
        //         isAdmin: user.isAdmin,
        //         token: user.accessToken,
        //     }
        // });

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
}




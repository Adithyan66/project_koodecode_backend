import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus";
import { ForgotPasswordUseCase } from "../../../application/usecases/users/ForgotPasswordUseCase";
import { config } from "../../../infrastructure/config/config";
import { LoginUserResponse } from "../../../application/dto/users/loginUserResponse";
import { AppError } from "../../../shared/exceptions/AppError";


export class ForgotPasswordController {

    constructor(
        private forgotPasswordUseCase: ForgotPasswordUseCase
    ) { }

    async requestOtp(req: Request, res: Response) {

        try {

            const { email } = req.body;

            if (!email) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: "email is required"
                })
                return
            }

            const data = await this.forgotPasswordUseCase.otpRequestExecute(email)

            console.log("data", data);


            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "otp sent successfully"
            })

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "something wrong"
            })

        }
    }

    async verifyOtp(req: Request, res: Response) {

        const { email, otp } = req.body

        console.log("victimmmmm", otp);
        

        if (!email || !otp) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "email and otp required"
            })
        }

        let response = await this.forgotPasswordUseCase.verifyOtp(email, otp)

        res.status(HTTP_STATUS.OK).json({
            success: response,
            message: "otp verified succesfully"
        })
    }

    async changePassword(req: Request, res: Response) {

        // try {

        const { email, otp, password } = req.body

        if (!email || !otp || !password) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "email , otp , password required"
            })
        }

        let { user } = await this.forgotPasswordUseCase.changePAsswordExecute(email, otp, password)

        res.cookie("refreshToken", user.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            path: "/",
            maxAge: config.cookieMaxAge
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Password changed succesfully",
            user
        })

        // } catch (error) {
        //     console.log(error);

        //     res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        //         success: false,
        //         message: "inernal server error",
        //     })
        // }

    }

}


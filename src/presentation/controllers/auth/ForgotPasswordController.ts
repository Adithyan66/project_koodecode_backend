import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus";


export class ForgotPasswordController {

    constructor(
        private forgotPasswordUseCase: any
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

            const data = await this.forgotPasswordUseCase.requestOtp(email)

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "otp sent successfully"
            })

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:"something wrong"
            })

        }
    }

}


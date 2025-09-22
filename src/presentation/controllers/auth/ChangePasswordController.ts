import { Request, Response } from "express";
import { ChangePasswordUseCase } from "../../../application/usecases/auth/ChangePasswordUseCase";
import { HTTP_STATUS } from "../../../shared/constants/httpStatus";


export class ChangePasswordController {
    constructor(
        private changePasswordUseCase: ChangePasswordUseCase
    ) { }

    async changePassword(req: Request, res: Response) {
        console.log(req.body);
        

        const { password, newPassword } = req.body

        const userId = req.user?.userId

        if (!password || !newPassword || !userId) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'All Fields required'
            })
            return
        }

        await this.changePasswordUseCase.execute(userId, password, newPassword)

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "password changed succesfully"
        })
    }

}
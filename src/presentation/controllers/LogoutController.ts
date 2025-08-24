import { Request, Response } from "express";

export class LogoutController {
    constructor() { }

    async logoutUser(req: Request, res: Response) {

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,    
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out"
        });

    }
}
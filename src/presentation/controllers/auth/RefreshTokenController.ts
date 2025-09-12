import { Request, Response } from "express";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { ITokenService } from "../../../domain/interfaces/services/ITokenService";
import { TokenPayload } from "../../../shared/types/TokenPayload";


export class RefreshTokenController {
    constructor(private tokenService: ITokenService) {
    }

    async verifyToken(req: Request, res: Response) {

        try {
            const token = req.cookies.refreshToken



            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "No refresh token provided"
                });
            }

            const data: TokenPayload | null = this.tokenService.verifyRefreshToken(token)

            if (!data) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired refresh token"
                });
            }

            const payload = {
                userId: data.userId,
                role: data.role
            };

            const newAccessToken = this.tokenService.generateAccessToken(payload);

            console.log("cookies pAYLOOOd", newAccessToken);

            return res.status(200).json({
                success: true,
                message: "acces token created succesfully",
                accessToken: newAccessToken
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "failed to refresh token"
            })
        }
    }
}
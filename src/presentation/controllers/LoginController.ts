import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';

export class LoginController {

    constructor(private loginUseCase: LoginUseCase) { }

    async login(req: Request, res: Response) {

        const { email, password } = req.body;

        try {

            const result = await this.loginUseCase.execute(email, password);

            console.log("hellooo login result.token", result);

            res.status(200).json({
                success: true,
                message: "logged in succesfull",
                user: {
                    id: "Adithya",
                    name: "string",
                    email: "string",
                    role: "admin"
                },
                token: result.token
            });

        } catch (error: any) {

            res.status(401).json({
                success: false,
                message: error.message,
                error: error.message
            });
        }
    }
}

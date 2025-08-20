import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';

export class LoginController {

    constructor(private loginUseCase: LoginUseCase) { }

    async login(req: Request, res: Response) {

        const { email, password } = req.body;

        try {
            const result = await this.loginUseCase.execute(email, password);

            res.status(200).json({ token: result.token });

        } catch (error: any) {

            res.status(401).json({ error: error.message });
        }
    }
}

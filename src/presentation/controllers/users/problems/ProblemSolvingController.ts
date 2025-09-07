



import { Request, Response } from 'express';
import { ExecuteCodeUseCase } from '../../../..***REMOVED***eCodeUseCase';
import { GetSubmissionResultUseCase } from '../../../..***REMOVED***missionResultUseCase';
import { RunCodeUseCase } from '../../../..***REMOVED***eUseCase';
import { GetLanguagesUseCase } from '../../../..***REMOVED***guagesUseCase';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { Messages } from '../../../../shared/constants/messages';


interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}


export class ProblemSolvingController {
    constructor(
        private executeCodeUseCase: ExecuteCodeUseCase,
        private getSubmissionResultUseCase: GetSubmissionResultUseCase,
        private runCodeUseCase: RunCodeUseCase,
        private getLanguagesUseCase: GetLanguagesUseCase
    ) { }

    async submitSolution(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {


            const { problemId, sourceCode, languageId } = req.body;
            const  userId  = req.user?.userId;

            if (!userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: Messages.UNAUTHORIZED_ACCESS
                });
                return;
            }

            if (!problemId || !sourceCode || !languageId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Problem ID, source code, and language ID are required'
                });
                return;
            }

            const result = await this.executeCodeUseCase.execute({
                userId,
                problemId,
                sourceCode,
                languageId
            });

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: result,
                message: 'Solution submitted successfully'
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }
    }

    async getSubmissionResult(req: Request, res: Response): Promise<void> {
        try {
            const { submissionId } = req.params;

            const result = await this.getSubmissionResultUseCase.execute(submissionId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: error.message
            });
        }
    }

    async runCode(req: Request, res: Response): Promise<void> {
        try {
            const { sourceCode, languageId, stdin, timeLimit, memoryLimit } = req.body;

            if (!sourceCode || !languageId) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Source code and language ID are required'
                });
                return;
            }

            const result = await this.runCodeUseCase.execute({
                sourceCode,
                languageId,
                stdin,
                timeLimit,
                memoryLimit
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLanguages(req: Request, res: Response): Promise<void> {
        try {
            const languages = await this.getLanguagesUseCase.execute();

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: languages
            });
        } catch (error: any) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }
}


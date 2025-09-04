// import { Request, Response } from 'express';
// // import { GetProblemDetailUseCase } from '../../../../application/usecases/problems/GetProblemDetailUseCase';
// import { GetProblemByIdUseCase } from '../../../../application/usecases/problems/GetProblemByIdUseCase';
// import { CreateSubmissionUseCase } from '../../../../application/usecases/submissions/CreateSubmissionUseCase';
// import { RunCodeUseCase } from '../../../../application/usecases/submissions/RunCodeUseCase';

// export class ProblemSolvingController {
//     constructor(
//         private getProblemDetailUseCase: GetProblemByIdUseCase,
//         private createSubmissionUseCase: CreateSubmissionUseCase,
//         private runCodeUseCase: RunCodeUseCase
//     ) {}


//     async runCode(req: Request, res: Response): Promise<void> {
//         try {
//             const runCodeDto = req.body;
//             const results = await this.runCodeUseCase.execute(runCodeDto);

//             res.status(200).json({
//                 success: true,
//                 data: {
//                     testResults: results,
//                     status: results.every(r => r.passed) ? 'accepted' : 'rejected'
//                 }
//             });
//         } catch (error) {
//             res.status(400).json({
//                 success: false,
//                 message: error instanceof Error ? error.message : 'Code execution failed'
//             });
//         }
//     }

//     async submitSolution(req: Request, res: Response): Promise<void> {
//         try {
//             const createSubmissionDto = req.body;
//             const userId = (req as any).user.id; // From auth middleware

//             const submission = await this.createSubmissionUseCase.execute(
//                 createSubmissionDto,
//                 userId
//             );

//             res.status(201).json({
//                 success: true,
//                 data: submission
//             });
//         } catch (error) {
//             res.status(400).json({
//                 success: false,
//                 message: error instanceof Error ? error.message : 'Submission failed'
//             });
//         }
//     }
// }







import { Request, Response } from 'express';
import { ExecuteCodeUseCase } from '../../../../application/usecases/submissions/ExecuteCodeUseCase';
import { GetSubmissionResultUseCase } from '../../../../application/usecases/submissions/GetSubmissionResultUseCase';
import { RunCodeUseCase } from '../../../../application/usecases/submissions/RunCodeUseCase';
import { GetLanguagesUseCase } from '../../../../application/usecases/submissions/GetLanguagesUseCase';
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


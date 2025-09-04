import { ISubmissionRepository } from '../../interfaces/ISubmissionRepository';
import { IProblemRepository } from '../../interfaces/IProblemRepository';
import { ICodeExecutionService } from '../../interfaces/ICodeExecutionService';
import { CreateSubmissionDto } from '../../dto/submissions/CreateSubmissionDto';
import { SubmissionResponseDto } from '../../dto/submissions/SubmissionResponseDto';
import { Submission } from '../../../domain/entities/Submission';

export class CreateSubmissionUseCase {
    constructor(
        private submissionRepository: ISubmissionRepository,
        private problemRepository: IProblemRepository,
        private codeExecutionService: ICodeExecutionService
    ) {}

    async execute(dto: CreateSubmissionDto, userId: string): Promise<SubmissionResponseDto> {
        // Validate problem exists
        const problem = await this.problemRepository.findById(dto.problemId);
        if (!problem) {
            throw new Error('Problem not found');
        }

        // Create initial submission
        const submission = new Submission(
            '', // Will be set by repository
            dto.problemId,
            userId,
            dto.code,
            dto.language,
            'pending',
            []
        );

        // Save submission
        const savedSubmission = await this.submissionRepository.create(submission);

        // Execute code asynchronously
        this.executeCodeAsync(savedSubmission.id, problem, dto.code, dto.language);

        return this.mapToDto(savedSubmission, problem);
    }

    private async executeCodeAsync(
        submissionId: string, 
        problem: any, 
        code: string, 
        language: string
    ): Promise<void> {
        try {
            const results = await this.codeExecutionService.executeCode(
                code,
                language,
                problem.testCases
            );

            const allPassed = results.every(result => result.passed);
            const status = allPassed ? 'accepted' : 'rejected';

            await this.submissionRepository.updateStatus(submissionId, status, results);

            // Update problem statistics
            await this.problemRepository.updateSubmissionStats(
                problem.id,
                allPassed
            );
        } catch (error) {
            await this.submissionRepository.updateStatus(submissionId, 'error', []);
        }
    }

    private mapToDto(submission: Submission, problem: any): SubmissionResponseDto {
        return {
            id: submission.id,
            problemId: submission.problemId,
            problemTitle: problem.title,
            code: submission.code,
            language: submission.language,
            status: submission.status,
            testResults: submission.testResults,
            executionTime: submission.executionTime,
            memoryUsage: submission.memoryUsage,
            createdAt: submission.createdAt.toISOString(),
            submittedAt: submission.submittedAt?.toISOString()
        };
    }
}


import { inject, injectable } from 'tsyringe';
import { IUserStatsService } from '../../domain/interfaces/services/IUserStatsService';
import { IProblemRepository } from '../../domain/interfaces/repositories/IProblemRepository';
import { ISubmissionRepository } from '../../domain/interfaces/repositories/ISubmissionRepository';
import { IPostSubmissionHandler, PostSubmissionData } from '../interfaces/IPostSubmissionHandler';

@injectable()
export class PostSubmissionHandler implements IPostSubmissionHandler {

    constructor(
        @inject('IUserStatsService') private userStatsService: IUserStatsService,
        @inject('IProblemRepository') private problemRepository: IProblemRepository,
        @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository
    ) { }

    async handleSubmission(data: PostSubmissionData): Promise<void> {

        console.log(`PostSubmissionHandler.handleSubmission called for user ${data.userId}, problem ${data.problemId}, isAccepted: ${data.isAccepted}`);

        try {

            await this.updateProblemStatistics(data.problemId, data.isAccepted, data.executionTime);

            await this.updateUserStatistics(data, data.difficulty);

            console.log(`Post-submission processing completed for user ${data.userId}, problem ${data.problemId}`);

        } catch (error) {
            console.error('Error in post-submission processing:', error);
        }
    }

    private async updateProblemStatistics(problemId: string, isAccepted: boolean, executionTime?: number): Promise<void> {

        try {

            const problem = await this.problemRepository.findById(problemId);
            if (!problem) return;

            problem.incrementSubmissionStats(isAccepted);

            if (isAccepted && executionTime) {
                problem.updateAverageSolveTime(executionTime);
            }

            await this.problemRepository.update(problemId, {
                totalSubmissions: problem.totalSubmissions,
                acceptedSubmissions: problem.acceptedSubmissions,
                lastSolvedAt: problem.lastSolvedAt,
                averageSolveTime: problem.averageSolveTime,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error(`Error updating problem statistics for ${problemId}:`, error);
        }
    }

    private async updateUserStatistics(data: PostSubmissionData, difficulty: 'easy' | 'medium' | 'hard'): Promise<void> {

        try {
            await this.userStatsService.updateSubmissionStats(
                data.userId,
                data.problemId,
                data.isAccepted,
                difficulty,
                data.languageId
            );

            // If this is a first-time solve, increment unique solvers count for the problem
            if (data.isAccepted) {
                await this.incrementUniqueSolvers(data.problemId, data.userId);
            }
        } catch (error) {
            console.error(`Error updating user statistics for ${data.userId}:`, error);
        }
    }

    private async incrementUniqueSolvers(problemId: string, userId: string): Promise<void> {
        try {
            // Check if this is the user's first accepted submission for this problem
            const userSubmissions = await this.submissionRepository.findByUserIdAndProblemId(userId, problemId);
            const acceptedSubmissions = userSubmissions.filter(sub => sub.status === 'accepted');

            // If this is the first accepted submission, increment unique solvers
            if (acceptedSubmissions.length === 1) {
                const problem = await this.problemRepository.findById(problemId);
                if (problem) {
                    problem.incrementUniqueSolvers();
                    await this.problemRepository.update(problemId, {
                        uniqueSolvers: problem.uniqueSolvers,
                        updatedAt: new Date()
                    });
                }
            }
        } catch (error) {
            console.error(`Error incrementing unique solvers for problem ${problemId}:`, error);
        }
    }

    async handleFailedSubmission(data: PostSubmissionData): Promise<void> {

        try {

            await this.updateProblemStatistics(data.problemId, false);

            await this.userStatsService.updateSubmissionStats(
                data.userId,
                data.problemId,
                false,
                data.difficulty,
                data.languageId
            );

            console.log(`Failed submission processing completed for user ${data.userId}, problem ${data.problemId}`);
        } catch (error) {
            console.error('Error in failed submission processing:', error);
        }
    }
}

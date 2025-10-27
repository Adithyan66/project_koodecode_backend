import { inject, injectable } from 'tsyringe';
import { ISubmissionRepository } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { IUserProfileRepository } from '../../../../domain/interfaces/repositories/IUserProfileRepository';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { IGetUserSubmissionDataUseCase } from '../../../interfaces/IUserUseCase';
import { UserSubmissionDataDto } from '../../../dto/users/admin/UserSubmissionDataDto';
import { NotFoundError } from '../../../errors/AppErrors';
import { ProgrammingLanguage } from '../../../../domain/value-objects/ProgrammingLanguage';
import { Problem } from '../../../../domain/entities/Problem';

@injectable()
export class GetUserSubmissionDataUseCase implements IGetUserSubmissionDataUseCase {

  constructor(
    @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository,
    @inject('IUserProfileRepository') private userProfileRepository: IUserProfileRepository,
    @inject('IProblemRepository') private problemRepository: IProblemRepository
  ) {}

  async execute(userId: string, page: number, limit: number): Promise<UserSubmissionDataDto> {

    const userProfile = await this.userProfileRepository.findByUserId(userId);
    if (!userProfile) {
      throw new NotFoundError('User not found');
    }

    const totalSubmissions = await this.submissionRepository.countByUserId(userId, 'problem');
    
    const allSubmissions = await this.submissionRepository.findByUserId(userId);
    const problemSubmissions = allSubmissions.filter(sub => sub.submissionType === 'problem');

    const acceptedSubmissions = problemSubmissions.filter(
      sub => sub.status === 'accepted'
    ).length;

    const rejectedSubmissions = problemSubmissions.filter(
      sub => sub.status !== 'accepted' && sub.status !== 'pending' && sub.status !== 'processing'
    ).length;

    const languageMap = new Map<number, number>();
    
    problemSubmissions.forEach(sub => {
      const count = languageMap.get(sub.languageId) || 0;
      languageMap.set(sub.languageId, count + 1);
    });

    const submissionsByLanguage = Array.from(languageMap.entries())
      .map(([languageId, count]) => {
        const languageInfo = ProgrammingLanguage.getLanguageInfo(languageId);
        const languageName = languageInfo ? languageInfo.name : `Language ${languageId}`;
        return {
          language: languageName,
          count,
          percentage: totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0
        };
      })
      .sort((a, b) => b.count - a.count); 

    const paginatedSubmissions = await this.submissionRepository.findByUserIdPaginated(
      userId,
      page,
      limit,
      'problem'
    );

    // console.log(paginatedSubmissions);
    

    // Map to DTO format
    // Note: problemId is already populated by the repository
    const submissions = await Promise.all(
      paginatedSubmissions.map(async (submission) => {
        const languageInfo = ProgrammingLanguage.getLanguageInfo(submission.languageId);
        const languageName = languageInfo ? languageInfo.name : `Language ${submission.languageId}`;
        
        // Fetch problem details for title
        const problem = await this.problemRepository.findById(submission.problemId);

        return {
          submissionId: submission.id,
          problemTitle: problem ? problem.title : 'Unknown Problem',
          language: languageName,
          status: submission.status,
          submittedAt: submission.createdAt?.toISOString() || new Date().toISOString(),
          score: submission.score || 0,
          totalExecutionTime: submission.totalExecutionTime || 0,
          maxMemoryUsage: submission.maxMemoryUsage || 0,
          sourceCode: submission.sourceCode
        };
      })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalSubmissions / limit);

    return {
      totalSubmissions,
      acceptedSubmissions,
      rejectedSubmissions,
      submissionsByLanguage,
      submissions,
      pagination: {
        page,
        limit,
        total: totalSubmissions,
        totalPages
      }
    };
  }
}


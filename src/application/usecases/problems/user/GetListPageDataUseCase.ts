import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { ISubmissionRepository } from '../../../../domain/interfaces/repositories/ISubmissionRepository';
import { ListPageDataResponseDto, BannerDto, StatsDto, CalendarEntryDto } from '../../../dto/problems/users/ListPageDataDto';
import { IGetListPageDataUseCase } from '../../../interfaces/IProblemUseCase';

@injectable()
export class GetListPageDataUseCase implements IGetListPageDataUseCase {

  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository,
    @inject('ISubmissionRepository') private submissionRepository: ISubmissionRepository
  ) { }

  async execute(userId: string): Promise<ListPageDataResponseDto> {
    
    const banners = this.getBanners();
    
    const [stats, calendar] = await Promise.all([
      this.getStats(userId),
      this.getCalendar(userId)
    ]);
    
    return {
      banners,
      stats,
      calendar
    };
  }
  
  private getBanners(): BannerDto[] {
    return [
      { id: 1, bannerurl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085" },
      { id: 2, bannerurl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3" },
      { id: 3, bannerurl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd" },
      { id: 4, bannerurl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085" }
    ];
  }
  
  private async getStats(userId: string): Promise<StatsDto> {
    const overallStats = await this.problemRepository.getOverallStats();
    
    const allSubmissions = await this.submissionRepository.findByUserId(userId);
    const problemSubmissions = allSubmissions.filter(sub => sub.submissionType === 'problem');
    const acceptedSubmissions = problemSubmissions.filter(sub => sub.status === 'accepted');
    const solvedProblems = new Set(acceptedSubmissions.map(sub => sub.problemId));
    
    return {
      solved: solvedProblems.size,
      total: overallStats.totalProblems
    };
  }
  
  private async getCalendar(userId: string): Promise<CalendarEntryDto[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    const submissions = await this.submissionRepository.findByUserIdAndDateRange(
      userId,
      startDate,
      endDate,
      'problem'
    );
    
    const acceptedSubmissions = submissions.filter(sub => sub.status === 'accepted');
    
    const dailyActivity = new Map<number, { solved: boolean; count: number }>();
    
    acceptedSubmissions.forEach(sub => {
      if (sub.createdAt) {
        const day = sub.createdAt.getDate();
        const existing = dailyActivity.get(day);
        
        if (existing) {
          existing.count += 1;
        } else {
          dailyActivity.set(day, { solved: true, count: 1 });
        }
      }
    });
    
    const calendar: CalendarEntryDto[] = [];
    dailyActivity.forEach((value, day) => {
      calendar.push({
        date: day,
        solved: value.solved,
        count: value.count
      });
    });
    
    calendar.sort((a, b) => a.date - b.date);
    
    return calendar;
  }
}


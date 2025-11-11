

export class UserProfile {

    public userId: string;
    public bio?: string;
    public location?: string;
    public birthdate?: Date;
    public gender?: 'male' | 'female' | 'other';
    public githubUrl?: string;
    public linkedinUrl?: string;
    public ranking?: number;
    public acceptanceRate: number;
    public contestRating: number;
    public coinBalance: number;
    public totalProblems: number;
    public easyProblems: number;
    public mediumProblems: number;
    public hardProblems: number;
    public totalSubmissions: number;
    public acceptedSubmissions: number;
    public rejectedSubmissions: number;
    public problemsAttempted: string[];
    public problemsSolved: string[];
    public firstSolveDate?: Date;
    public lastSolveDate?: Date;
    public averageSolveTime?: number;
    public languagesUsed: Record<number, number>;
    public streak: UserStreak;
    public activeDays: number;
    public isPremium: boolean;
    public isBlocked: boolean;
    public badges: UserBadge[];
    public leaderboard?: LeaderboardData;
    public hints: ProblemHint[];
    public activities: DailyActivity[];
    public lastLogin?: Date;
    public id?: string;
    public createdAt?: Date;
    public updatedAt?: Date;

    constructor({
        userId,
        bio,
        location,
        birthdate,
        gender,
        githubUrl,
        linkedinUrl,
        ranking,
        acceptanceRate = 0,
        contestRating = 0,
        coinBalance = 0,
        totalProblems = 0,
        easyProblems = 0,
        mediumProblems = 0,
        hardProblems = 0,
        totalSubmissions = 0,
        acceptedSubmissions = 0,
        rejectedSubmissions = 0,
        problemsAttempted = [],
        problemsSolved = [],
        firstSolveDate,
        lastSolveDate,
        averageSolveTime,
        languagesUsed = {},
        streak = new UserStreak(),
        activeDays = 0,
        isPremium = false,
        isBlocked = false,
        badges = [],
        leaderboard,
        hints = [],
        activities = [],
        lastLogin,
        id,
        createdAt,
        updatedAt,
    }: {
        userId: string;
        bio?: string;
        location?: string;
        birthdate?: Date;
        gender?: 'male' | 'female' | 'other';
        githubUrl?: string;
        linkedinUrl?: string;
        ranking?: number;
        acceptanceRate?: number;
        contestRating?: number;
        coinBalance?: number;
        totalProblems?: number;
        easyProblems?: number;
        mediumProblems?: number;
        hardProblems?: number;
        totalSubmissions?: number;
        acceptedSubmissions?: number;
        rejectedSubmissions?: number;
        problemsAttempted?: string[];
        problemsSolved?: string[];
        firstSolveDate?: Date;
        lastSolveDate?: Date;
        averageSolveTime?: number;
        languagesUsed?: Record<number, number>;
        streak?: UserStreak;
        activeDays?: number;
        isPremium?: boolean;
        isBlocked?: boolean;
        badges?: UserBadge[];
        leaderboard?: LeaderboardData;
        hints?: ProblemHint[];
        activities?: DailyActivity[];
        lastLogin?: Date;
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.userId = userId;
        this.bio = bio;
        this.location = location;
        this.birthdate = birthdate;
        this.gender = gender;
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
        this.ranking = ranking;
        this.acceptanceRate = acceptanceRate;
        this.contestRating = contestRating;
        this.coinBalance = coinBalance;
        this.totalProblems = totalProblems;
        this.easyProblems = easyProblems;
        this.mediumProblems = mediumProblems;
        this.hardProblems = hardProblems;
        this.totalSubmissions = totalSubmissions;
        this.acceptedSubmissions = acceptedSubmissions;
        this.rejectedSubmissions = rejectedSubmissions;
        this.problemsAttempted = problemsAttempted;
        this.problemsSolved = problemsSolved;
        this.firstSolveDate = firstSolveDate;
        this.lastSolveDate = lastSolveDate;
        this.averageSolveTime = averageSolveTime;
        this.languagesUsed = languagesUsed;
        this.streak = streak;
        this.activeDays = activeDays;
        this.isPremium = isPremium;
        this.isBlocked = isBlocked;
        this.badges = badges;
        this.leaderboard = leaderboard;
        this.hints = hints;
        this.activities = activities;
        this.lastLogin = lastLogin;
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }



    public calculateAcceptanceRate(totalSubmissions: number, acceptedSubmissions: number): number {
        if (totalSubmissions === 0) return 0;
        return Math.round((acceptedSubmissions / totalSubmissions) * 100);
    }

    public addActivity(date: Date, activityType: ActivityType, count: number = 1): void {
        const dateStr = date.toISOString().split('T')[0];
        const existingActivity = this.activities.find(a => a.date === dateStr);

        if (existingActivity) {
            existingActivity.count += count;
            if (!existingActivity.activities.includes(activityType)) {
                existingActivity.activities.push(activityType);
            }
        } else {
            this.activities.push(new DailyActivity(dateStr, [activityType], count));
        }
    }

    public getActivityCalendar(year: number): Map<string, number> {
        const calendar = new Map<string, number>();
        const yearPrefix = year.toString();

        this.activities
            .filter(activity => activity.date.startsWith(yearPrefix))
            .forEach(activity => {
                calendar.set(activity.date, activity.count);
            });

        return calendar;
    }

    public addProblemAttempt(problemId: string): void {
        if (!this.problemsAttempted.includes(problemId)) {
            this.problemsAttempted.push(problemId);
        }
    }

    public addProblemSolved(problemId: string, difficulty: 'easy' | 'medium' | 'hard'): void {
        if (!this.problemsSolved.includes(problemId)) {
            this.problemsSolved.push(problemId);
            this.totalProblems += 1;
            
            switch (difficulty) {
                case 'easy':
                    this.easyProblems += 1;
                    break;
                case 'medium':
                    this.mediumProblems += 1;
                    break;
                case 'hard':
                    this.hardProblems += 1;
                    break;
            }

            // Update solve dates
            const now = new Date();
            if (!this.firstSolveDate) {
                this.firstSolveDate = now;
            }
            this.lastSolveDate = now;
        }
    }

    public incrementSubmissionStats(isAccepted: boolean): void {
        this.totalSubmissions += 1;
        if (isAccepted) {
            this.acceptedSubmissions += 1;
        } else {
            this.rejectedSubmissions += 1;
        }
        
        // Recalculate acceptance rate
        this.acceptanceRate = this.calculateAcceptanceRate(this.totalSubmissions, this.acceptedSubmissions);
    }

    public trackLanguageUsage(languageId: number): void {
        this.languagesUsed[languageId] = (this.languagesUsed[languageId] || 0) + 1;
    }

    public getMostUsedLanguage(): number | null {
        let maxCount = 0;
        let mostUsedLanguage: number | null = null;
        
        for (const [languageId, count] of Object.entries(this.languagesUsed)) {
            if (count > maxCount) {
                maxCount = count;
                mostUsedLanguage = parseInt(languageId);
            }
        }
        
        return mostUsedLanguage;
    }

    public hasActivityOnDate(date: string): boolean {
        return this.activities.some(activity => activity.date === date);
    }

    public getMissedDaysInCurrentMonth(): string[] {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const missedDays: string[] = [];
        
        for (let day = new Date(firstDayOfMonth); day < today; day.setDate(day.getDate() + 1)) {
            const dateStr = day.toISOString().split('T')[0];
            if (!this.hasActivityOnDate(dateStr)) {
                missedDays.push(dateStr);
            }
        }
        
        return missedDays;
    }

    public canFillDate(dateStr: string): { canFill: boolean; reason?: string } {
        const targetDate = new Date(dateStr + 'T00:00:00Z');
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        if (targetDate >= today) {
            return { canFill: false, reason: 'Cannot fill today or future dates' };
        }
        
        if (targetDate.getMonth() !== currentMonth || targetDate.getFullYear() !== currentYear) {
            return { canFill: false, reason: 'Can only fill dates in the current month' };
        }
        
        if (this.hasActivityOnDate(dateStr)) {
            return { canFill: false, reason: 'This date already has activity' };
        }
        
        return { canFill: true };
    }

    public fillMissedDay(dateStr: string): void {
        const validation = this.canFillDate(dateStr);
        if (!validation.canFill) {
            throw new Error(validation.reason);
        }
        
        this.addActivity(new Date(dateStr), ActivityType.TIME_TRAVEL_USED, 1);
    }
}

export class UserStreak {
    constructor(
        public currentCount: number = 0,
        public maxCount: number = 0,
        public lastActiveDate?: Date,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
    ) { }

    public updateStreak(isActive: boolean, currentDate: Date = new Date()): void {
        const today = new Date(currentDate.toISOString().split('T')[0]);
        const lastActive = this.lastActiveDate ? new Date(this.lastActiveDate.toISOString().split('T')[0]) : null;

        if (isActive) {
            if (!lastActive) {
                this.currentCount = 1;
            } else if (this.isSameDay(lastActive, today)) {
                // Already counted for today
            } else if (this.isConsecutiveDay(lastActive, today)) {
                this.currentCount += 1;
            } else {
                this.currentCount = 1; // Reset streak and start from 1
            }

            this.maxCount = Math.max(this.maxCount, this.currentCount);
            this.lastActiveDate = currentDate;
        } else {
            if (lastActive && !this.isConsecutiveDay(lastActive, today)) {
                this.currentCount = 0; // Break streak
            }
        }
        this.updatedAt = currentDate;
    }

    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getTime() === date2.getTime();
    }

    private isConsecutiveDay(lastDate: Date, currentDate: Date): boolean {
        const oneDayMs = 24 * 60 * 60 * 1000;
        const diffMs = currentDate.getTime() - lastDate.getTime();
        return diffMs === oneDayMs;
    }
}

export class UserBadge {
    constructor(
        public badgeId: string,
        public badgeType: BadgeType,
        public name: string,
        public description: string,
        public iconUrl: string,
        public awardedAt: Date,
        public criteria?: BadgeCriteria,
    ) { }
}

export enum BadgeType {
    PROBLEM_SOLVER = "problem_solver",
    STREAK_MASTER = "streak_master",
    CONTEST_WINNER = "contest_winner",
    LANGUAGE_EXPERT = "language_expert",
    DAILY_CODER = "daily_coder",
    DIFFICULTY_MASTER = "difficulty_master",
    SPEED_DEMON = "speed_demon",
    CONSISTENCY = "consistency",
    MILESTONE = "milestone"
}

export class BadgeCriteria {
    constructor(
        public type: string,
        public threshold: number,
        public description: string,
        public metadata?: Record<string, any>,
    ) { }
}

export class LeaderboardData {
    constructor(
        public totalScore: number,
        public totalContests: number,
        public globalRank: number,
        public updatedAt: Date,
    ) { }
}

export class ProblemHint {
    constructor(
        public problemId: string,
        public hintText: string,
        public requestedAt: Date,
    ) { }
}

export class DailyActivity {
    constructor(
        public date: string, // YYYY-MM-DD format
        public activities: ActivityType[],
        public count: number = 1,
    ) { }
}

export enum ActivityType {
    PROBLEM_SOLVED = "problem_solved",
    CONTEST_PARTICIPATED = "contest_participated",
    STREAK_MAINTAINED = "streak_maintained",
    LOGIN = "login",
    HINT_USED = "hint_used",
    BADGE_EARNED = "badge_earned",
    TIME_TRAVEL_USED = "time_travel_used"
}

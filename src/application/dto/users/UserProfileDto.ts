

export interface UserProfileDto {
    userId: string;
    bio?: string;
    location?: string;
    birthdate?: string;
    gender?: 'male' | 'female' | 'other';
    githubUrl?: string;
    linkedinUrl?: string;
}

export interface UserProfileResponseDto {
    user: {
        id: string;
        fullName: string;
        userName: string;
        email: string;
        profilePicKey?: string;
    };
    profile: {
        bio?: string;
        location?: string;
        birthdate?: string;
        gender?: string;
        githubUrl?: string;
        linkedinUrl?: string;
        isPremium: boolean;
        ranking?: number;
        coinBalance: number;
    };
    stats: {
        followersCount: number;
        followingCount: number;
        totalProblems: number;
        problemsByDifficulty: {
            easy: number;
            medium: number;
            hard: number;
        };
        totalSubmissions: number;
        acceptedSubmissions: number;
        rejectedSubmissions: number;
        problemsAttempted: number;
        problemsSolved: number;
        firstSolveDate?: string;
        lastSolveDate?: string;
        averageSolveTime?: number;
        languagesUsed: Record<string, number>;
        streak: {
            current: number;
            max: number;
            lastActiveDate?: string;
        };
        badges: number;
        acceptanceRate: number;
        contestRating: number;
        activeDays: number;
    };
    activities: Record<string, number>;
    recentBadges: Array<{
        badgeId: string;
        name: string;
        description: string;
        iconUrl: string;
        badgeType: string;
        rarity: string;
        awardedAt: string;
    }>;
}

export interface UpdateProfileDto {
    fullname?:string;
    bio?: string;
    location?: string;
    birthdate?: string;
    gender?: 'male' | 'female' | 'other';
    githubUrl?: string;
    linkedinUrl?: string;
}

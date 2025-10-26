// Frontend User interface
export interface User {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    provider: string;
    emailVerified: boolean;
    profilePicKey?: string;
}

// Frontend Badge interface
export interface Badge {
    badgeId: string;
    badgeType: string;
    name: string;
    description: string;
    iconUrl: string;
    awardedAt: string;
    criteria: {
        type: string;
        threshold: number;
        description: string;
        metadata?: Record<string, any>;
    };
}

// Frontend UserDetail interface (extends User)
export interface UserDetailDto extends User {
    // Extended Profile Info
    googleId?: string;
    githubId?: string;
    bio?: string;
    location?: string;
    birthdate?: string;
    gender?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    
    // Performance Metrics
    ranking?: number;
    acceptanceRate?: number;
    contestRating?: number;
    coinBalance?: number;
    totalProblems?: number;
    easyProblems?: number;
    mediumProblems?: number;
    hardProblems?: number;
    activeDays?: number;
    
    // Status
    isBlocked?: boolean;
    lastLogin?: string;
    
    // Streak Data
    streak?: {
        currentCount: number;
        maxCount: number;
        lastActiveDate: string;
    };
    
    // Badges
    badges?: Badge[];
}

export interface UserBadgeDto {
  badgeId: string;
  badgeType: string;
  name: string;
  description: string;
  iconUrl: string;
  awardedAt: string;
  criteria?: {
    type: string;
    threshold: number;
    description: string;
    metadata?: Record<string, any>;
  };
}

export interface UserStreakDto {
  currentCount: number;
  maxCount: number;
  lastActiveDate?: string;
}

export interface GetUserProfileResponseDto {
  // Basic User Info
  user: {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    googleId?: string;
    githubId?: string;
    emailVerified: boolean;
    profilePicKey?: string;
    createdAt: string;
    updatedAt: string;
  }
  // Extended Profile Info
  UserProfile: {
    bio?: string;
    location?: string;
    birthdate?: string;
    gender?: 'male' | 'female' | 'other';
    githubUrl?: string;
    linkedinUrl?: string;
    coinBalance: number;
  }
  // Performance Metrics
  ranking?: number;
  acceptanceRate: number;
  contestRating: number;
  totalProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
  activeDays: number;

  // Status
  isBlocked: boolean;
  lastLogin?: string;

  // Streak Data
  streak: UserStreakDto;

  // Badges
  badges: UserBadgeDto[];
}

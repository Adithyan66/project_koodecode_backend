

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
        profileImage: string;
        name: string;
        username: string;
        bio?: string;
        location?: string;
        githubUrl?: string;
        linkedinUrl?: string;
        languages: Array<{ name: string; count: number }>;
    };
    stats: {
        easy: { solved: number; total: number };
        medium: { solved: number; total: number };
        hard: { solved: number; total: number };
        attempting: number;
    };
    badges: {
        total: number;
        list: Array<{ id: string; imageUrl: string }>;
        recent?: {
            imageUrl: string;
            title: string;
            year: number;
        };
    };
    heatmap: {
        data: Array<{ date: string; count: number }>;
        totalSubmissions: number;
        activeDays: number;
        maxStreak: number;
        currentStreak: number;
    };
    recentSubmissions: Array<{ id: string; title: string; timeAgo: string }>;
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

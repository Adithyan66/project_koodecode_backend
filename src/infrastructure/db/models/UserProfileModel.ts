import { Schema, model, Document, Types } from 'mongoose';

export interface IBadge {
    badgeId: Types.ObjectId;
    badgeType: string;
    name: string;
    description: string;
    iconUrl: string;
    awardedAt: Date;
    criteria?: {
        type: string;
        threshold: number;
        description: string;
        metadata?: Record<string, any>;
    };
}

export interface ILeaderboard {
    totalScore: number;
    totalContests: number;
    globalRank: number;
    updatedAt: Date;
}

export interface IHint {
    problemId: Types.ObjectId;
    hintText: string;
    requestedAt: Date;
}

export interface IStreak {
    currentCount: number;
    maxCount: number;
    lastActiveDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDailyActivity {
    date: string; // YYYY-MM-DD format
    activities: string[];
    count: number;
}

export interface IUserProfile extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId; // Reference to User
    
    // Profile Information
    bio?: string;
    location?: string;
    birthdate?: Date;
    gender?: 'male' | 'female' | 'other';
    githubUrl?: string;
    linkedinUrl?: string;
    
    // Statistics
    ranking?: number;
    acceptanceRate: number;
    contestRating: number;
    coinBalance: number;
    
    // Problem Solving Stats
    totalProblems: number;
    easyProblems: number;
    mediumProblems: number;
    hardProblems: number;
    
    // Streak Information
    streak: IStreak;
    activeDays: number;
    
    // Premium & Status
    isPremium: boolean;
    isBlocked: boolean;
    
    // Achievements
    badges: IBadge[];
    leaderboard?: ILeaderboard;
    hints: IHint[];
    
    // Activity Calendar (embedded)
    activities: IDailyActivity[];
    
    // Timestamps
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
    badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    badgeType: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    iconUrl: { type: String, required: true },
    awardedAt: { type: Date, required: true },
    criteria: {
        type: { type: String },
        threshold: { type: Number },
        description: { type: String },
        metadata: { type: Schema.Types.Mixed }
    }
});

const LeaderboardSchema = new Schema<ILeaderboard>({
    totalScore: { type: Number, required: true, default: 0 },
    totalContests: { type: Number, required: true, default: 0 },
    globalRank: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, required: true, default: Date.now },
});

const HintSchema = new Schema<IHint>({
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    requestedAt: { type: Date, required: true },
    hintText: { type: String, required: true },
});

const StreakSchema = new Schema<IStreak>({
    currentCount: { type: Number, required: true, default: 0 },
    maxCount: { type: Number, required: true, default: 0 },
    lastActiveDate: { type: Date },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});

const DailyActivitySchema = new Schema<IDailyActivity>({
    date: { type: String, required: true }, // YYYY-MM-DD
    activities: [{ type: String, required: true }],
    count: { type: Number, required: true, default: 1 }
});

const UserProfileSchema = new Schema<IUserProfile>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Profile Information
    bio: { type: String, maxlength: 500 },
    location: { type: String },
    birthdate: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    
    // Statistics
    ranking: { type: Number },
    acceptanceRate: { type: Number, default: 0, min: 0, max: 100 },
    contestRating: { type: Number, default: 0 },
    coinBalance: { type: Number, default: 0 },
    
    // Problem Solving Stats
    totalProblems: { type: Number, default: 0 },
    easyProblems: { type: Number, default: 0 },
    mediumProblems: { type: Number, default: 0 },
    hardProblems: { type: Number, default: 0 },
    
    // Streak Information
    streak: { type: StreakSchema, default: () => ({}) },
    activeDays: { type: Number, default: 0 },
    
    // Premium & Status
    isPremium: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    
    // Achievements
    badges: { type: [BadgeSchema], default: [] },
    leaderboard: { type: LeaderboardSchema },
    hints: { type: [HintSchema], default: [] },
    
    // Activity Calendar (embedded)
    activities: { type: [DailyActivitySchema], default: [] },
    
    // Timestamps
    lastLogin: { type: Date },
}, {
    timestamps: true
});

// Indexes for better performance
UserProfileSchema.index({ userId: 1 });
UserProfileSchema.index({ ranking: 1 });
UserProfileSchema.index({ totalProblems: -1 });
UserProfileSchema.index({ 'streak.currentCount': -1 });
UserProfileSchema.index({ 'activities.date': 1 });

export const UserProfileModel = model<IUserProfile>('UserProfile', UserProfileSchema);

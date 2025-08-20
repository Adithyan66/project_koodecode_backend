



import { Schema, model, Document, Types } from 'mongoose';

export interface IBadge {
    badgeId: Types.ObjectId;
    awardedAt: Date;
    streak_currentCount: number;
    streak_lastActiveDate: Date;
    streak_createdAt: Date;
    streak_updatedAt: Date;
}

export interface ILeaderboard {
    totalScore: number;
    totalContests: number;
    globalRank: number;
    updatedAt: Date;
}

export interface IHint {
    problemId: Types.ObjectId;
    requestedAt: Date;
    hintText: string;
}

export interface IStreak {
    currentCount: number;
    lastActiveDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser extends Document {
    fullName: string;
    email: string;
    userName: string;
    passwordHash: string;
    isPremium: boolean;
    updatedAt: Date;
    lastLogin: Date;
    gender: 'male' | 'female' | 'other';
    location: string;
    birthdate: Date;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
    ranking: number;
    profilePicUrl: string;
    isBlocked: boolean;
    isAdmin: boolean;
    totalProblems: number;
    totalProblemsSolved: number;
    totalEasyProblems: number;
    easyProblemsSolved: number;
    totalMediumProblems: number;
    mediumProblemsSolved: number;
    totalHardProblems: number;
    hardProblemsSolved: number;
    currentStreak: number;
    activeDays: number;
    maxStreak: number;
    acceptanceRate: number;
    totalSubmissions: number;
    contestsParticipated: number;
    contestRating: number;
    coinBalance: number;
    badges: IBadge[];
    leaderboard: ILeaderboard;
    hints: IHint[];
    streak: IStreak;
}

const BadgeSchema = new Schema<IBadge>({
    badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    awardedAt: { type: Date, required: true },
    streak_currentCount: { type: Number, required: true },
    streak_lastActiveDate: { type: Date, required: true },
    streak_createdAt: { type: Date, required: true },
    streak_updatedAt: { type: Date, required: true },
});

const LeaderboardSchema = new Schema<ILeaderboard>({
    totalScore: { type: Number, required: true },
    totalContests: { type: Number, required: true },
    globalRank: { type: Number, required: true },
    updatedAt: { type: Date, required: true },
});

const HintSchema = new Schema<IHint>({
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    requestedAt: { type: Date, required: true },
    hintText: { type: String, required: true },
});

const StreakSchema = new Schema<IStreak>({
    currentCount: { type: Number, required: true },
    lastActiveDate: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
});

const UserSchema = new Schema<IUser>({
    fullName: { type: String },
    email: { type: String, unique: true },
    userName: { type: String, },
    passwordHash: { type: String, },
    isPremium: { type: Boolean, default: false },
    updatedAt: { type: Date },
    lastLogin: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    location: { type: String },
    birthdate: { type: Date },
    bio: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    ranking: { type: Number },
    profilePicUrl: { type: String },
    isBlocked: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    // totalProblems: { type: Number, default: 0 },
    // totalProblemsSolved: { type: Number, default: 0 },
    // totalEasyProblems: { type: Number, default: 0 },
    // easyProblemsSolved: { type: Number, default: 0 },
    // totalMediumProblems: { type: Number, default: 0 },
    // mediumProblemsSolved: { type: Number, default: 0 },
    // totalHardProblems: { type: Number, default: 0 },
    // hardProblemsSolved: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    activeDays: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    // totalSubmissions: { type: Number, default: 0 },
    // contestsParticipated: { type: Number, default: 0 },
    contestRating: { type: Number, default: 0 },
    coinBalance: { type: Number, default: 0 },
    badges: { type: [BadgeSchema], default: [] },
    leaderboard: { type: LeaderboardSchema },
    hints: { type: [HintSchema], default: [] },
    streak: { type: StreakSchema },
});

export const UserModel = model<IUser>('User', UserSchema);

import { Schema, model, Document } from 'mongoose';

export interface IBadgeDefinition extends Document {
    name: string;
    description: string;
    type: string;
    iconUrl: string;
    category: string;
    rarity: string;
    criteria: {
        type: string;
        threshold: number;
        description: string;
        metadata?: Record<string, any>;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BadgeDefinitionSchema = new Schema<IBadgeDefinition>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['problem_solver', 'streak_master', 'contest_winner', 'language_expert', 'daily_coder', 'difficulty_master', 'speed_demon', 'consistency', 'milestone']
    },
    iconUrl: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['achievement', 'progress', 'milestone', 'special', 'seasonal']
    },
    rarity: {
        type: String,
        required: true,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    criteria: {
        type: { type: String, required: true },
        threshold: { type: Number, required: true },
        description: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed }
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

BadgeDefinitionSchema.index({ type: 1, isActive: 1 });
BadgeDefinitionSchema.index({ category: 1, rarity: 1 });

export const BadgeModel = model<IBadgeDefinition>('Badge', BadgeDefinitionSchema);

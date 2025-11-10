import { BadgeType, BadgeCriteria } from './UserProfile';

export class Badge {
    constructor(
        public name: string,
        public description: string,
        public type: BadgeType,
        public iconUrl: string,
        public criteria: BadgeCriteria,
        public category: BadgeCategory,
        public rarity: BadgeRarity = BadgeRarity.COMMON,
        public isActive: boolean = true,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
    ) {}
}

export enum BadgeCategory {
    ACHIEVEMENT = "achievement",
    PROGRESS = "progress",
    MILESTONE = "milestone",
    SPECIAL = "special",
    SEASONAL = "seasonal"
}

export enum BadgeRarity {
    COMMON = "common",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary"
}
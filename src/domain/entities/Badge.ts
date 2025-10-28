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

import { BadgeType, BadgeCriteria } from './UserProfile';

// Pre-defined badge templates for seeding
export const BADGE_DEFINITIONS = [
    // Problem Solving Badges
    {
        name: "First Steps",
        description: "Solved your first problem",
        type: BadgeType.PROBLEM_SOLVER,
        category: BadgeCategory.ACHIEVEMENT,
        rarity: BadgeRarity.COMMON,
        iconUrl: "https://png.pngtree.com/png-clipart/20210322/ourmid/pngtree-golden-shield-vector-png-image_3105840.jpg",
        criteria: new BadgeCriteria("problems_solved", 1, "Solve 1 problem")
    },
    {
        name: "Problem Solver",
        description: "Solved 10 problems",
        type: BadgeType.PROBLEM_SOLVER,
        category: BadgeCategory.PROGRESS,
        rarity: BadgeRarity.COMMON,
        iconUrl: "/badges/problem-solver.svg",
        criteria: new BadgeCriteria("problems_solved", 10, "Solve 10 problems")
    },
    {
        name: "Dedicated Solver",
        description: "Solved 50 problems",
        type: BadgeType.PROBLEM_SOLVER,
        category: BadgeCategory.PROGRESS,
        rarity: BadgeRarity.RARE,
        iconUrl: "/badges/dedicated-solver.svg",
        criteria: new BadgeCriteria("problems_solved", 50, "Solve 50 problems")
    },
    {
        name: "Century Club",
        description: "Solved 100 problems",
        type: BadgeType.PROBLEM_SOLVER,
        category: BadgeCategory.MILESTONE,
        rarity: BadgeRarity.EPIC,
        iconUrl: "/badges/century-club.svg",
        criteria: new BadgeCriteria("problems_solved", 100, "Solve 100 problems")
    },
    
    // Streak Badges
    {
        name: "Week Warrior",
        description: "Maintained a 7-day streak",
        type: BadgeType.STREAK_MASTER,
        category: BadgeCategory.ACHIEVEMENT,
        rarity: BadgeRarity.COMMON,
        iconUrl: "/badges/week-warrior.svg",
        criteria: new BadgeCriteria("max_streak", 7, "Maintain 7-day streak")
    },
    {
        name: "Monthly Master",
        description: "Maintained a 30-day streak",
        type: BadgeType.STREAK_MASTER,
        category: BadgeCategory.ACHIEVEMENT,
        rarity: BadgeRarity.RARE,
        iconUrl: "/badges/monthly-master.svg",
        criteria: new BadgeCriteria("max_streak", 30, "Maintain 30-day streak")
    },
    {
        name: "Consistency King",
        description: "Maintained a 100-day streak",
        type: BadgeType.STREAK_MASTER,
        category: BadgeCategory.MILESTONE,
        rarity: BadgeRarity.LEGENDARY,
        iconUrl: "/badges/consistency-king.svg",
        criteria: new BadgeCriteria("max_streak", 100, "Maintain 100-day streak")
    },
    
    // Difficulty Badges
    {
        name: "Easy Rider",
        description: "Solved 50 Easy problems",
        type: BadgeType.DIFFICULTY_MASTER,
        category: BadgeCategory.PROGRESS,
        rarity: BadgeRarity.COMMON,
        iconUrl: "/badges/easy-rider.svg",
        criteria: new BadgeCriteria("easy_problems", 50, "Solve 50 Easy problems")
    },
    {
        name: "Medium Momentum",
        description: "Solved 25 Medium problems",
        type: BadgeType.DIFFICULTY_MASTER,
        category: BadgeCategory.PROGRESS,
        rarity: BadgeRarity.RARE,
        iconUrl: "/badges/medium-momentum.svg",
        criteria: new BadgeCriteria("medium_problems", 25, "Solve 25 Medium problems")
    },
    {
        name: "Hard Hitter",
        description: "Solved 10 Hard problems",
        type: BadgeType.DIFFICULTY_MASTER,
        category: BadgeCategory.ACHIEVEMENT,
        rarity: BadgeRarity.EPIC,
        iconUrl: "/badges/hard-hitter.svg",
        criteria: new BadgeCriteria("hard_problems", 10, "Solve 10 Hard problems")
    },
    
    // Daily Activity Badges
    {
        name: "Daily Coder",
        description: "Active for 30 different days",
        type: BadgeType.DAILY_CODER,
        category: BadgeCategory.PROGRESS,
        rarity: BadgeRarity.RARE,
        iconUrl: "/badges/daily-coder.svg",
        criteria: new BadgeCriteria("active_days", 30, "Be active for 30 days")
    },
    {
        name: "Dedication Master",
        description: "Active for 100 different days",
        type: BadgeType.DAILY_CODER,
        category: BadgeCategory.MILESTONE,
        rarity: BadgeRarity.EPIC,
        iconUrl: "/badges/dedication-master.svg",
        criteria: new BadgeCriteria("active_days", 100, "Be active for 100 days")
    }
];

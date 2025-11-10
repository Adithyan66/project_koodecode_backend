import { injectable } from 'tsyringe';
import { Badge } from '../../domain/entities/Badge';
import { BadgeCriteria, UserProfile } from '../../domain/entities/UserProfile';

@injectable()
export class BadgeEligibilityService  {
    
    evaluate(profile: UserProfile, badge: Badge) {
        const currentValue = this.resolveCurrentValue(profile, badge.criteria);
        const eligible = currentValue >= badge.criteria.threshold;

        return {
            eligible,
            criteriaType: badge.criteria.type,
            currentValue,
            threshold: badge.criteria.threshold
        };
    }

    private resolveCurrentValue(profile: UserProfile, criteria: BadgeCriteria): number {
        switch (criteria.type) {
            case 'problems_solved':
                return profile.totalProblems;
            case 'easy_problems':
                return profile.easyProblems;
            case 'medium_problems':
                return profile.mediumProblems;
            case 'hard_problems':
                return profile.hardProblems;
            case 'max_streak':
                return profile.streak.maxCount;
            case 'active_days':
                return profile.activeDays;
            default:
                return 0;
        }
    }
}


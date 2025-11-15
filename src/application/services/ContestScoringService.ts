

import { ContestParticipant, ContestSubmission } from '../../domain/entities/ContestParticipant';
import { Contest } from '../../domain/entities/Contest';

export class ContestScoringService {
  calculateScore(
    participant: ContestParticipant,
    contest: Contest,
    newSubmission: ContestSubmission
  ): number {
    if (!newSubmission.isCorrect) {
      return participant.totalScore - contest.wrongSubmissionPenalty;
    }

    const baseScore = 1000;
    
    const timeBonus = this.calculateTimeBonus(newSubmission.timeTaken, contest.problemTimeLimit);
    
    const attemptPenalty = this.calculateAttemptPenalty(newSubmission.attemptNumber);
    
    const previousPenalties = participant.submissions
      .filter(sub => !sub.isCorrect)
      .reduce((total, sub) => total + sub.penaltyApplied, 0);

    const finalScore = baseScore + timeBonus - attemptPenalty - previousPenalties;
    return Math.max(0, finalScore); 
  }

  private calculateTimeBonus(timeTaken: number, timeLimit: number): number {
    const timeLimitSeconds = timeLimit * 60;
    const timeRatio = timeTaken / timeLimitSeconds;
    
    // More points for faster solutions (max 500 bonus points)
    return Math.floor(500 * (1 - timeRatio));
  }

  private calculateAttemptPenalty(attemptNumber: number): number {
    // Penalty increases with more attempts (50 points per additional attempt)
    return Math.max(0, (attemptNumber - 1) * 50);
  }

  calculateCoinRewards(participants: ContestParticipant[], contest: Contest): Map<string, number> {
    const coinMap = new Map<string, number>();
    
    // Sort participants by score (descending), then by time (ascending)
    const sortedParticipants = participants
      .filter(p => p.status === 'completed' || p.status === 'time_up')
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return a.getTimeTaken() - b.getTimeTaken();
      });

    // Award coins based on contest rewards configuration
    contest.coinRewards.forEach(reward => {
      if (sortedParticipants[reward.rank - 1]) {
        const participant = sortedParticipants[reward.rank - 1];
        coinMap.set(participant.userId, reward.coins);
      }
    });

    return coinMap;
  }
}




export interface ContestRegistrationDto {
  contestId: string;
}

export interface ContestRegistrationResponseDto {
  participantId: string;
  contestId: string;
  assignedProblemTitle: string;
  registrationTime: Date;
  message: string;
}

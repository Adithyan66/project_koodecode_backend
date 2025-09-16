import { Constraint } from "../../../domain/entities/Problem";


export interface ContestResponseDto {
  id: string;
  contestNumber: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  registrationDeadline: Date;
  problemTimeLimit: number;
  thumbnail: string;
  maxAttempts: number;
  totalParticipants: number;
  coinRewards: ContestRewardDto[];
  state: string;
  canRegister: boolean;
  isRegistered: boolean;
  assignedProblem?: AssignedProblemDto;
  timeRemaining?: number;
  createdAt: Date;

}


// export interface AssignedProblemDto {
//   id: string;
//   title: string;
//   difficulty: string;
//   description: string;
//   constraints: Constraint[];
//   examples: any[];
// }

export interface AssignedProblemDto {
  problem: {
    id: string,
    problemNumber: number,
    title: string,
    slug: string,
    difficulty: string,
    tags: string[],
    description: string,
    constraints: Constraint[],
    examples: {
       input: string;
    output: string;
    explanation: string;
    isSample?: boolean;
    }[],
    likes: number,
    totalSubmissions: number,
    acceptedSubmissions: number,
    acceptanceRate: number,
    hints: string[],
    companies: string[],
    isActive: boolean,
    functionName: string,
    returnType: string,
    parameters: {
    name: string;
    type: string;
    description?: string;
  }[];
    supportedLanguages: number[],
    templates:  Record<string, {
    templateCode: string;
    userFunctionSignature: string;
    placeholder: string;
  }>;
    createdAt: Date;
    updatedAt: Date
  }

  sampleTestCases: any;
  timeRemaining: any;
}

export interface ContestRewardDto {
  rank: number;
  coins: number;
}

import { inject, injectable } from 'tsyringe';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { MESSAGES } from '../../../../shared/constants/messages';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { UnauthorizedError } from '../../../../application/errors/AppErrors';
import { IGetAdminActiveContestsUseCase } from '../../../../application/interfaces/IAdminContestUseCase';
import { IGetAdminUpcomingContestsUseCase } from '../../../../application/interfaces/IAdminContestUseCase';
import { IGetAdminPastContestsUseCase } from '../../../../application/interfaces/IAdminContestUseCase';
import { IGetAdminContestByIdUseCase } from '../../../../application/interfaces/IAdminContestUseCase';
import { IUpdateContestUseCase } from '../../../../application/interfaces/IAdminContestUseCase';
import { IDeleteContestUseCase } from '../../../../application/interfaces/IAdminContestUseCase';
import { AdminContestListRequestDto, UpdateContestDto } from '../../../../application/dto/contests/AdminContestDto';
import { CreateContestDto } from '../../../../application/dto/contests/CreateContestDto';
import { ICreateContestUseCase } from '../../../../application/interfaces/IContestUseCase';

@injectable()
export class AdminContestController {
  constructor(
    @inject('ICreateContestUseCase') private createContestUseCase: ICreateContestUseCase,
    @inject('IGetAdminActiveContestsUseCase') private getActiveContestsUseCase: IGetAdminActiveContestsUseCase,
    @inject('IGetAdminUpcomingContestsUseCase') private getUpcomingContestsUseCase: IGetAdminUpcomingContestsUseCase,
    @inject('IGetAdminPastContestsUseCase') private getPastContestsUseCase: IGetAdminPastContestsUseCase,
    @inject('IGetAdminContestByIdUseCase') private getContestByIdUseCase: IGetAdminContestByIdUseCase,
    @inject('IUpdateContestUseCase') private updateContestUseCase: IUpdateContestUseCase,
    @inject('IDeleteContestUseCase') private deleteContestUseCase: IDeleteContestUseCase
  ) {}

  createContest = async (httpRequest: IHttpRequest) => {
    const createContestDto: CreateContestDto = httpRequest.body;
    const adminUserId = httpRequest.user?.userId;

    if (!adminUserId) {
      throw new UnauthorizedError();
    }

    const contest = await this.createContestUseCase.execute(createContestDto, adminUserId);

    return new HttpResponse(HTTP_STATUS.CREATED, {
      ...buildResponse(true, MESSAGES.CONTEST_CREATED_SUCCESSFULLY, contest),
    });
  };

  getActiveContests = async (httpRequest: IHttpRequest) => {
    const adminUserId = httpRequest.user?.userId;

    if (!adminUserId) {
      throw new UnauthorizedError();
    }

    const result = await this.getActiveContestsUseCase.execute();

//     const activeContestsResponse = {
//   success: true,
//   message: MESSAGES.ACTIVE_CONTESTS_RETRIEVED,
//   data: {
//     contests: [
//       {
//         id: "contest_123456789",
//         contestNumber: 15,
//         title: "Weekly Coding Challenge #15",
//         description:
//           "A challenging contest featuring algorithms and data structures problems",
//         createdBy: "admin_user_123",
//         startTime: "2024-01-15T10:00:00.000Z",
//         endTime: "2024-01-15T12:00:00.000Z",
//         thumbnail:
//           "https://s3.amazonaws.com/contest-thumbnails/weekly-challenge-15.jpg",
//         registrationDeadline: "2024-01-15T09:30:00.000Z",
//         problemTimeLimit: 30,
//         maxAttempts: 3,
//         wrongSubmissionPenalty: 10,
//         coinRewards: [
//           { rank: 1, coins: 100 },
//           { rank: 2, coins: 75 },
//           { rank: 3, coins: 50 },
//         ],
//         state: "ACTIVE",
//         createdAt: "2024-01-10T08:00:00.000Z",
//         updatedAt: "2024-01-15T10:00:00.000Z",
//         stats: {
//           totalParticipants: 45,
//           completedParticipants: 12,
//           inProgressParticipants: 33,
//           averageScore: 67.5,
//           totalProblems: 3,
//           maxPossibleScore: 1000,
//           isActive: true,
//           timeRemaining: 3600000,
//         },
//         problems: [
//           {
//             id: "problem_001",
//             problemNumber: 1,
//             title: "Two Sum",
//             description:
//               "Find two numbers in an array that add up to a target value",
//             difficulty: "easy",
//             tags: ["array", "hash-table"],
//             totalSubmissions: 45,
//             acceptedSubmissions: 38,
//             acceptanceRate: 84,
//             isActive: true,
//           },
//           {
//             id: "problem_002",
//             problemNumber: 2,
//             title: "Binary Tree Traversal",
//             description:
//               "Implement inorder, preorder, and postorder traversal",
//             difficulty: "medium",
//             tags: ["tree", "recursion"],
//             totalSubmissions: 32,
//             acceptedSubmissions: 18,
//             acceptanceRate: 56,
//             isActive: true,
//           },
//         ],
//         topPerformers: [
//           {
//             rank: 1,
//             username: "alice_coder",
//             profileImage: "https://s3.amazonaws.com/profile-pics/alice.jpg",
//             totalScore: 950,
//             timeTaken: "1h 23m 45s",
//             attempts: 5,
//             status: "In Progress",
//             coinsEarned: 100,
//           },
//           {
//             rank: 2,
//             username: "bob_programmer",
//             profileImage: "https://s3.amazonaws.com/profile-pics/bob.jpg",
//             totalScore: 875,
//             timeTaken: "1h 45m 12s",
//             attempts: 7,
//             status: "In Progress",
//             coinsEarned: 75,
//           },
//         ],
//         status: {
//           currentState: "ACTIVE",
//           timeUntilStart: null,
//           timeUntilEnd: 3600000,
//           timeUntilRegistrationDeadline: null,
//           isRegistrationOpen: false,
//           isActive: true,
//           isEnded: false,
//           canRegister: false,
//           hasStarted: true,
//           hasEnded: false,
//         },
//       },
//       {
//         id: "contest_123456789",
//         contestNumber: 15,
//         title: "Weekly Coding Challenge #15",
//         description:
//           "A challenging contest featuring algorithms and data structures problems",
//         createdBy: "admin_user_123",
//         startTime: "2024-01-15T10:00:00.000Z",
//         endTime: "2024-01-15T12:00:00.000Z",
//         thumbnail:
//           "https://s3.amazonaws.com/contest-thumbnails/weekly-challenge-15.jpg",
//         registrationDeadline: "2024-01-15T09:30:00.000Z",
//         problemTimeLimit: 30,
//         maxAttempts: 3,
//         wrongSubmissionPenalty: 10,
//         coinRewards: [
//           { rank: 1, coins: 100 },
//           { rank: 2, coins: 75 },
//           { rank: 3, coins: 50 },
//         ],
//         state: "ACTIVE",
//         createdAt: "2024-01-10T08:00:00.000Z",
//         updatedAt: "2024-01-15T10:00:00.000Z",
//         stats: {
//           totalParticipants: 45,
//           completedParticipants: 12,
//           inProgressParticipants: 33,
//           averageScore: 67.5,
//           totalProblems: 3,
//           maxPossibleScore: 1000,
//           isActive: true,
//           timeRemaining: 3600000,
//         },
//         problems: [
//           {
//             id: "problem_001",
//             problemNumber: 1,
//             title: "Two Sum",
//             description:
//               "Find two numbers in an array that add up to a target value",
//             difficulty: "easy",
//             tags: ["array", "hash-table"],
//             totalSubmissions: 45,
//             acceptedSubmissions: 38,
//             acceptanceRate: 84,
//             isActive: true,
//           },
//           {
//             id: "problem_002",
//             problemNumber: 2,
//             title: "Binary Tree Traversal",
//             description:
//               "Implement inorder, preorder, and postorder traversal",
//             difficulty: "medium",
//             tags: ["tree", "recursion"],
//             totalSubmissions: 32,
//             acceptedSubmissions: 18,
//             acceptanceRate: 56,
//             isActive: true,
//           },
//         ],
//         topPerformers: [
//           {
//             rank: 1,
//             username: "alice_coder",
//             profileImage: "https://s3.amazonaws.com/profile-pics/alice.jpg",
//             totalScore: 950,
//             timeTaken: "1h 23m 45s",
//             attempts: 5,
//             status: "In Progress",
//             coinsEarned: 100,
//           },
//           {
//             rank: 2,
//             username: "bob_programmer",
//             profileImage: "https://s3.amazonaws.com/profile-pics/bob.jpg",
//             totalScore: 875,
//             timeTaken: "1h 45m 12s",
//             attempts: 7,
//             status: "In Progress",
//             coinsEarned: 75,
//           },
//         ],
//         status: {
//           currentState: "ACTIVE",
//           timeUntilStart: null,
//           timeUntilEnd: 3600000,
//           timeUntilRegistrationDeadline: null,
//           isRegistrationOpen: false,
//           isActive: true,
//           isEnded: false,
//           canRegister: false,
//           hasStarted: true,
//           hasEnded: false,
//         },
//       },
//     ],
//   },
// };


    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, MESSAGES.ACTIVE_CONTESTS_RETRIEVED, result),
    });
  };

  getUpcomingContests = async (httpRequest: IHttpRequest) => {
    const adminUserId = httpRequest.user?.userId;

    if (!adminUserId) {
      throw new UnauthorizedError();
    }

    const result = await this.getUpcomingContestsUseCase.execute();

    const upcomingContestsResponse = {
  success: true,
  message: MESSAGES.UPCOMING_CONTESTS_RETRIEVED,
  data: {
    contests: [
      {
        id: "contest_987654321",
        contestNumber: 16,
        title: "Monthly Algorithm Challenge",
        description: "Advanced algorithms and competitive programming problems",
        createdBy: "admin_user_123",
        startTime: "2024-01-20T14:00:00.000Z",
        endTime: "2024-01-20T18:00:00.000Z",
        thumbnail: "https://s3.amazonaws.com/contest-thumbnails/monthly-challenge-16.jpg",
        registrationDeadline: "2024-01-20T13:30:00.000Z",
        problemTimeLimit: 45,
        maxAttempts: 5,
        wrongSubmissionPenalty: 15,
        coinRewards: [
          { rank: 1, coins: 200 },
          { rank: 2, coins: 150 },
          { rank: 3, coins: 100 },
          { rank: 4, coins: 75 },
          { rank: 5, coins: 50 }
        ],
        state: "UPCOMING",
        createdAt: "2024-01-12T10:00:00.000Z",
        updatedAt: "2024-01-12T10:00:00.000Z",
        stats: {
          totalParticipants: 0,
          completedParticipants: 0,
          inProgressParticipants: 0,
          averageScore: 0,
          totalProblems: 4,
          maxPossibleScore: 1000,
          isActive: false,
          timeRemaining: null
        },
        problems: [
          {
            id: "problem_003",
            problemNumber: 1,
            title: "Dynamic Programming Challenge",
            description: "Solve complex DP problems with optimal substructure",
            difficulty: "hard",
            tags: ["dynamic-programming", "optimization"],
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            acceptanceRate: 0,
            isActive: true
          },
          {
            id: "problem_004",
            problemNumber: 2,
            title: "Graph Algorithms",
            description: "Implement various graph traversal and shortest path algorithms",
            difficulty: "medium",
            tags: ["graph", "algorithms"],
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            acceptanceRate: 0,
            isActive: true
          }
        ],
        topPerformers: [],
        status: {
          currentState: "UPCOMING",
          timeUntilStart: 432000000,
          timeUntilEnd: 576000000,
          timeUntilRegistrationDeadline: 414000000,
          isRegistrationOpen: true,
          isActive: false,
          isEnded: false,
          canRegister: true,
          hasStarted: false,
          hasEnded: false
        }
      }
    ]
  }
};


    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, MESSAGES.UPCOMING_CONTESTS_RETRIEVED, result),
    });
  };
 pastContestsResponse = {
  success: true,
  message: MESSAGES.PAST_CONTESTS_RETRIEVED,
  data: {
    contests: [
      {
        id: "contest_456789123",
        contestNumber: 14,
        title: "Weekly Coding Challenge #14",
        description: "Previous week's coding challenge with array and string problems",
        createdBy: "admin_user_123",
        startTime: "2024-01-08T10:00:00.000Z",
        endTime: "2024-01-08T12:00:00.000Z",
        thumbnail: "https://s3.amazonaws.com/contest-thumbnails/weekly-challenge-14.jpg",
        registrationDeadline: "2024-01-08T09:30:00.000Z",
        problemTimeLimit: 30,
        maxAttempts: 3,
        wrongSubmissionPenalty: 10,
        coinRewards: [
          { rank: 1, coins: 100 },
          { rank: 2, coins: 75 },
          { rank: 3, coins: 50 }
        ],
        state: "ENDED",
        createdAt: "2024-01-03T08:00:00.000Z",
        updatedAt: "2024-01-08T12:00:00.000Z",
        stats: {
          totalParticipants: 67,
          completedParticipants: 67,
          inProgressParticipants: 0,
          averageScore: 72.3,
          totalProblems: 3,
          maxPossibleScore: 1000,
          isActive: false,
          timeRemaining: null
        },
        problems: [
          {
            id: "problem_005",
            problemNumber: 1,
            title: "Palindrome Checker",
            description: "Check if a string is a palindrome",
            difficulty: "easy",
            tags: ["string", "two-pointers"],
            totalSubmissions: 67,
            acceptedSubmissions: 58,
            acceptanceRate: 87,
            isActive: true
          }
        ],
        participants: [
          {
            id: "participant_001",
            userId: "user_123",
            username: "charlie_dev",
            email: "charlie@example.com",
            fullName: "Charlie Developer",
            profileImage: "https://s3.amazonaws.com/profile-pics/charlie.jpg",
            assignedProblemId: "problem_005",
            registrationTime: "2024-01-08T09:15:00.000Z",
            startTime: "2024-01-08T10:00:00.000Z",
            endTime: "2024-01-08T11:45:00.000Z",
            totalScore: 950,
            rank: 1,
            coinsEarned: 100,
            status: "Completed",
            attempts: 3,
            timeTaken: 6300,
            submissions: [
              {
                id: "submission_001",
                submittedAt: "2024-01-08T10:15:00.000Z",
                isCorrect: false,
                timeTaken: 900,
                attemptNumber: 1,
                penaltyApplied: 10,
                status: "rejected"
              },
              {
                id: "submission_002",
                submittedAt: "2024-01-08T11:30:00.000Z",
                isCorrect: true,
                timeTaken: 6300,
                attemptNumber: 2,
                penaltyApplied: 0,
                status: "accepted"
              }
            ]
          }
        ],
        status: {
          currentState: "ENDED",
          timeUntilStart: null,
          timeUntilEnd: null,
          timeUntilRegistrationDeadline: null,
          isRegistrationOpen: false,
          isActive: false,
          isEnded: true,
          canRegister: false,
          hasStarted: true,
          hasEnded: true
        }
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false
    }
  }
};

  getPastContests = async (httpRequest: IHttpRequest) => {
    const adminUserId = httpRequest.user?.userId;

    if (!adminUserId) {
      throw new UnauthorizedError();
    }

    const request: AdminContestListRequestDto = {
      page: httpRequest.query?.page ? parseInt(httpRequest.query.page as string) : 1,
      limit: httpRequest.query?.limit ? parseInt(httpRequest.query.limit as string) : 10,
      search: httpRequest.query?.search as string,
      fromDate: httpRequest.query?.fromDate as string,
      toDate: httpRequest.query?.toDate as string,
      sortBy: httpRequest.query?.sortBy as 'createdAt' | 'startTime' | 'endTime' | 'participantCount',
      sortOrder: httpRequest.query?.sortOrder as 'asc' | 'desc'
    };

    const result = await this.getPastContestsUseCase.execute(request);

    return new HttpResponse(HTTP_STATUS.OK, {
      ...buildResponse(true, MESSAGES.PAST_CONTESTS_RETRIEVED, result),
    });
  };

  getContestById = async (httpRequest: IHttpRequest) => {
    const adminUserId = httpRequest.user?.userId;
    const contestId = httpRequest.params?.contestId;

    if (!adminUserId) {
      throw new UnauthorizedError();
    }

    if (!contestId) {
      throw new Error(MESSAGES.CONTEST_ID_REQUIRED);
    }

    const contest = await this.getContestByIdUseCase.execute(contestId);

    return new HttpResponse(HTTP_STATUS.OK, {
      success: true,
      message: MESSAGES.CONTEST_DETAILS_RETRIEVED,
      data: {
        contest
      }
    });
  };

  updateContest = async (httpRequest: IHttpRequest) => {
    const adminUserId = httpRequest.user?.userId;
    const contestId = httpRequest.params?.contestId;
    const updateData: UpdateContestDto = httpRequest.body;

    if (!adminUserId) {
      throw new UnauthorizedError();
    }

    if (!contestId) {
      throw new Error(MESSAGES.CONTEST_ID_REQUIRED);
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error(MESSAGES.UPDATE_DATA_REQUIRED);
    }

    const updatedContest = await this.updateContestUseCase.execute(contestId, updateData);

    return new HttpResponse(HTTP_STATUS.OK, {
      success: true,
      message: MESSAGES.CONTEST_UPDATED_SUCCESSFULLY,
      data: {
        contest: updatedContest
      }
    });
  };

  deleteContest = async (httpRequest: IHttpRequest) => {
    const adminUserId = httpRequest.user?.userId;
    const contestId = httpRequest.params?.contestId;

    if (!adminUserId) {
      throw new UnauthorizedError();
    }

    if (!contestId) {
      throw new Error(MESSAGES.CONTEST_ID_REQUIRED);
    }

    const result = await this.deleteContestUseCase.execute(contestId);

    return new HttpResponse(HTTP_STATUS.OK, {
      success: result.success,
      message: result.message
    });
  };
}
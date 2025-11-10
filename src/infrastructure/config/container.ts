




import "reflect-metadata";
import { container } from "tsyringe";

import { JwtService } from "../services/JwtService";
import { PasswordService } from "../../application/services/PasswordService";
import { NodemailerEmailService } from "../services/NodemailerEmailService";
import { UsernameService } from "../services/UsernameService";
import { OAuthService } from "../services/OAuthService";

import { MongoUserRepository } from "../db/MongoUserRepository";
import { RedisOtpRepository } from "../persistence/RedisOtpRepository";

// Use cases
import { LoginUseCase } from "../../application/usecases/auth/LoginUseCase";
import { ValidateUserUseCase } from "../../application/usecases/auth/ValidateUserUseCase";
import { OtpUseCase } from "../../application/usecases/auth/OtpUseCase";
import { ForgotPasswordUseCase } from "../../application/usecases/auth/ForgotPasswordUseCase";
import { ChangePasswordUseCase } from "../../application/usecases/auth/ChangePasswordUseCase";
import { GoogleOAuthUseCase } from "../../application/usecases/auth/GoogleOAuthUseCase";
import { GitHubOAuthUseCase } from "../../application/usecases/auth/GitHubOAuthUseCase";
import { SignupUseCase } from "../../application/usecases/auth/SignupUseCase";
import { AuthController } from "../../presentation/http/controllers/authentication/AuthController";
import { UserCoinController } from "../../presentation/http/controllers/user/UserCoinController";
import { CreateCoinPurchaseOrderUseCase } from "../../application/usecases/coins/users/CreateCoinPurchaseOrderUseCase";
import { CompleteCoinPurchaseUseCase } from "../../application/usecases/coins/users/CompleteCoinPurchaseUseCase";
import { GetCoinBalanceUseCase } from "../../application/usecases/coins/users/GetCoinBalanceUseCase";
import { GetCoinTransactionsUseCase } from "../../application/usecases/coins/users/GetCoinTransactionsUseCase";
import { GetCoinStatsUseCase } from "../../application/usecases/coins/GetCoinStatsUseCase";
import { HandleRazorpayWebhookUseCase } from "../../application/usecases/coins/users/HandleRazorpayWebhookUseCase";
import { RazorpayWebhookController } from "../../presentation/http/controllers/webhooks/RazorpayWebhookController";
import { MongoCoinTransactionRepository } from "../db/MongoCoinTransactionRepository";
import { MongoUserProfileRepository } from "../db/MongoUserProfileRepository";
import { RazorpayGatewayService } from "../services/RazorpayGatewayService";
import { MongoCoinPurchaseRepository } from "../db/MongoCoinPurchaseRepository";
import { CoinPricingService } from "../services/CoinPricingService";
import { UserContestController } from "../../presentation/http/controllers/user/UserContestController";
import { RegisterForContestUseCase } from "../../application/usecases/contests/user/RegisterForContestUseCase";
import { StartContestProblemUseCase } from "../../application/usecases/contests/user/StartContestProblemUseCase";
import { GetContestLeaderboardUseCase } from "../../application/usecases/contests/user/GetContestLeaderboardUseCase";
import { GetContestsListUseCase } from "../../application/usecases/contests/user/GetContestsListUseCase";
import { GetContestDetailUseCase } from "../../application/usecases/contests/user/GetContestDetailUseCase";
import { SubmitContestSolutionUseCase } from "../../application/usecases/contests/user/SubmitContestSolutionUseCase";
import { MongoContestRepository } from "../db/MongoContestRepository";
import { MongoContestParticipantRepository } from "../db/MongoContestParticipantRepository";
import { MongoProblemRepository } from "../db/MongoProblemRepository";
import { MongoTestCaseRepository } from "../db/MongoTestCaseRepository";
import { MongoSubmissionRepository } from "../db/MongoSubmissionRepository";
import { ContestScoringService } from "../../application/services/ContestScoringService";
import { Judge0Service } from "../services/Judge0Service";
import { MongoCounterRepository } from "../db/MongoCounterRepository";
import { ContestTimerService } from "../../application/services/ContestTimerService";
import { CreateSubmissionUseCase } from "../../application/usecases/submissions/CreateSubmissionUseCase";
import { DistributeContestRewardsUseCase } from "../../application/usecases/contests/DistributeContestRewardsUseCase";
import { CodeExecutionHelperService } from "../../application/services/CodeExecutionHelperService";
import { GetProblemsListUseCase } from "../../application/usecases/problems/user/GetProblemsListUseCase";
import { GetProblemByIdUseCase } from "../../application/usecases/problems/user/GetProblemByIdUseCase";
import { GetSubmissionResultUseCase } from "../../application/usecases/submissions/GetSubmissionResultUseCase";
import { RunCodeUseCase } from "../../application/usecases/submissions/RunCodeUseCase";
import { GetLanguagesUseCase } from "../../application/usecases/submissions/GetLanguagesUseCase";
import { GetUserSubmissionHistoryUseCase } from "../../application/usecases/submissions/GetUserSubmissionHistoryUseCase";
import { GetProblemNamesUseCase } from "../../application/usecases/problems/user/GetProblemNamesUseCase";
import { GetListPageDataUseCase } from "../../application/usecases/problems/user/GetListPageDataUseCase";
import { AdminProblemController } from "../../presentation/http/controllers/admin/AdminProblemController";
import { CreateProblemUseCase } from "../../application/usecases/problems/admin/CreateProblemUseCase";
import { UserProfileController } from "../../presentation/http/controllers/user/UserProfileController";
import { UpdateUserProfileUseCase } from "../../application/usecases/users/user/UpdateUserProfileUseCase";
import { GetUserEditableProfile } from "../../application/usecases/users/user/GetUserEditableProfile";
import { GenerateProfileImageUploadUrlUseCase } from "../../application/usecases/users/user/GenerateProfileImageUploadUrlUseCase";
import { UpdateProfileImageUseCase } from "../../application/usecases/users/user/UpdateProfileImageUseCase";
import { MongoUserConnectionRepository } from "../db/MongoUserConnectionRepository";
import { S3Service } from "../services/S3Service";
import { ImageUploadService } from "../../application/services/ImageUploadService";
import { CreateRoomUseCase } from "../../application/usecases/rooms/users/CreateRoomUseCase";
import { JoinRoomUseCase } from "../../application/usecases/rooms/users/JoinRoomUseCase";
import { GetPublicRoomsUseCase } from "../../application/usecases/rooms/users/GetPublicRoomsUseCase";
import { UpdateRoomPermissionsUseCase } from "../../application/usecases/rooms/users/UpdateRoomPermissionsUseCase";
import { KickUserUseCase } from "../../application/usecases/rooms/users/KickUserUseCase";
import { VerifyPrivateRoomUseCase } from "../../application/usecases/rooms/users/VerifyPrivateRoomUseCase";
import { RoomSubmitCodeUseCase } from "../../application/usecases/rooms/RoomSubmitCodeUseCase";
import { MongoRoomRepository } from "../db/MongoRoomRepository";
import { MongoRoomActivityRepository } from "../db/MongoRoomActivityRepository";
import { GetAllRoomsForAdminUseCase } from "../../application/usecases/rooms/admin/GetAllRoomsForAdminUseCase";
import { AdminRoomController } from "../../presentation/http/controllers/admin/AdminRoomController";
import { UserStoreController } from "../../presentation/http/controllers/user/UserStoreController";
import { GetStoreItemsUseCase } from "../../application/usecases/store/user/GetStoreItemsUseCase";
import { PurchaseStoreItemUseCase } from "../../application/usecases/store/user/PurchaseStoreItemUseCase";
import { GetUserInventoryUseCase } from "../../application/usecases/store/user/GetUserInventoryUseCase";
import { CheckItemOwnershipUseCase } from "../../application/usecases/store/user/CheckItemOwnershipUseCase";
import { UseTimeTravelTicketUseCase } from "../../application/usecases/store/user/UseTimeTravelTicketUseCase";
import { GetMissedDaysUseCase } from "../../application/usecases/store/user/GetMissedDaysUseCase";
import { UpdateStoreItemUseCase } from "../../application/usecases/store/admin/UpdateStoreItemUseCase";
import { ToggleStoreItemActiveUseCase } from "../../application/usecases/store/admin/ToggleStoreItemActiveUseCase";
import { GetAllStoreItemsForAdminUseCase } from "../../application/usecases/store/admin/GetAllStoreItemsForAdminUseCase";
import { AdminStoreController } from "../../presentation/http/controllers/admin/AdminStoreController";
import { MongoStoreItemRepository } from "../db/MongoStoreItemRepository";
import { MongoUserInventoryRepository } from "../db/MongoUserInventoryRepository";
import { Judge0HealthService } from "../services/Judge0HealthService";
import { HealthController } from "../../presentation/http/controllers/shared/HealthController";
import { CreateContestUseCase } from "../../application/usecases/contests/admin/CreateContestUseCase";
import { GetAdminActiveContestsUseCase } from "../../application/usecases/contests/admin/GetAdminActiveContestsUseCase";
import { GetAdminUpcomingContestsUseCase } from "../../application/usecases/contests/admin/GetAdminUpcomingContestsUseCase";
import { GetAdminPastContestsUseCase } from "../../application/usecases/contests/admin/GetAdminPastContestsUseCase";
import { GetAdminContestByIdUseCase } from "../../application/usecases/contests/admin/GetAdminContestByIdUseCase";
import { UpdateContestUseCase } from "../../application/usecases/contests/admin/UpdateContestUseCase";
import { DeleteContestUseCase } from "../../application/usecases/contests/admin/DeleteContestUseCase";
import { AdminContestController } from "../../presentation/http/controllers/admin/AdminContestController";

import { createServer } from 'http';
import { SocketService } from "../services/SocketService";
import { GetAllProblemsForAdminUseCase } from "../../application/usecases/problems/admin/GetAllProblemsForAdminUseCase";
import { GetAllProgrammingLanguages } from "../../application/usecases/problems/user/GetAllProgrammingLanguages";
import { GetProblemDetailForAdminUseCase } from "../../application/usecases/problems/admin/GetProblemDetailForAdminUseCase";
import { GetProblemTestCasesForAdminUseCase } from '../../application/usecases/problems/admin/GetProblemTestCasesForAdminUseCase';
import { IGetProblemTestCasesForAdminUseCase } from '../../application/interfaces/ITestCaseUseCase';

import { UpdateProblemUseCase } from '../../application/usecases/problems/admin/UpdateProblemUseCase';
import { UpdateTestCaseUseCase } from '../../application/usecases/problems/admin/UpdateTestCaseUseCase';
import { AddTestCaseUseCase } from '../../application/usecases/problems/admin/AddTestCaseUseCase';
import { DeleteTestCaseUseCase } from '../../application/usecases/problems/admin/DeleteTestCaseUseCase';
import { DeleteProblemUseCase } from '../../application/usecases/problems/admin/DeleteProblemUseCase';
import { GenerateImageUploadUrlUseCase } from '../../application/usecases/shared/GenerateImageUploadUrlUseCase';
import { ConfirmImageUploadUseCase } from '../../application/usecases/shared/ConfirmImageUploadUseCase';
import { ImageServiceController } from '../../presentation/http/controllers/shared/ImageServiceController';



import { GetAllUsersUseCase } from '../../application/usecases/users/admin/GetAllUsersUseCase';
import { GetUserDetailsForAdminUseCase } from '../../application/usecases/users/admin/GetUserDetailsForAdminUseCase';
import { GetUserDetailForAdminUseCase } from '../../application/usecases/users/admin/GetUserDetailForAdminUseCase';
import { GetUserProfileUseCase } from '../../application/usecases/users/user/GetUserProfileUseCase';
import { AdminUserController } from '../../presentation/http/controllers/admin/AdminUserController';
import { ProfileImageMigrationService } from '../../application/services/ProfileImageMigrationService';
import { UserStatsService } from '../services/UserStatsService';
import { PostSubmissionHandler } from '../../application/services/PostSubmissionHandler';
import { MongoBadgeRepository } from '../db/MongoBadgeRepository';
import { ListAdminBadgesUseCase } from '../../application/usecases/badges/admin/ListAdminBadgesUseCase';
import { GetAdminBadgeDetailUseCase } from '../../application/usecases/badges/admin/GetAdminBadgeDetailUseCase';
import { UpdateAdminBadgeUseCase } from '../../application/usecases/badges/admin/UpdateAdminBadgeUseCase';
import { ToggleAdminBadgeStatusUseCase } from '../../application/usecases/badges/admin/ToggleAdminBadgeStatusUseCase';
import { ListBadgeHoldersUseCase } from '../../application/usecases/badges/admin/ListBadgeHoldersUseCase';

import { BlockUserUseCase, IBlockUserUseCase } from '../../application/usecases/users/admin/BlockUserUseCase';
import { GetUserContestDataUseCase } from '../../application/usecases/users/admin/GetUserContestDataUseCase';
import { GetUserSubmissionDataUseCase } from '../../application/usecases/users/admin/GetUserSubmissionDataUseCase';
import { GetUserFinancialDataUseCase } from '../../application/usecases/users/admin/GetUserFinancialDataUseCase';
import { GetUserStoreDataUseCase } from '../../application/usecases/users/admin/GetUserStoreDataUseCase';
import { GetUserRoomDataUseCase } from '../../application/usecases/users/admin/GetUserRoomDataUseCase';
import { ResetUserPasswordUseCase } from '../../application/usecases/users/admin/ResetUserPasswordUseCase';
import { SendMailToUserUseCase } from '../../application/usecases/users/admin/SendMailToUserUseCase';
import { GetAdminCoinPurchasesUseCase } from '../../application/usecases/coins/admin/GetAdminCoinPurchasesUseCase';
import { GetAdminCoinPurchaseDetailUseCase } from '../../application/usecases/coins/admin/GetAdminCoinPurchaseDetailUseCase';
import { ReconcileCoinPurchaseUseCase } from '../../application/usecases/coins/admin/ReconcileCoinPurchaseUseCase';
import { RefundCoinPurchaseUseCase } from '../../application/usecases/coins/admin/RefundCoinPurchaseUseCase';
import { AddNoteToPurchaseUseCase } from '../../application/usecases/coins/admin/AddNoteToPurchaseUseCase';
import { AdminCoinController } from '../../presentation/http/controllers/admin/AdminCoinController';
import { AwardCoinsUseCase } from '../../application/usecases/coins/AwardCoinsUseCase';
import { SubmissionDistributionService } from '../../application/services/SubmissionDistributionService';
import { DistributionCacheService } from '../services/DistributionCacheService';

import { MongoPushSubscriptionRepository } from '../db/MongoPushSubscriptionRepository';
import { WebPushService } from '../services/WebPushService';
import { SubscribeToPushUseCase } from '../../application/usecases/notifications/SubscribeToPushUseCase';
import { UnsubscribeFromPushUseCase } from '../../application/usecases/notifications/UnsubscribeFromPushUseCase';
import { SendAdminNotificationUseCase } from '../../application/usecases/notifications/SendAdminNotificationUseCase';
import { SendUserNotificationUseCase } from '../../application/usecases/notifications/SendUserNotificationUseCase';
import { NotificationController } from '../../presentation/http/controllers/notifications/NotificationController';

import { GetAllSubmissionsForAdminUseCase } from '../../application/usecases/submissions/admin/GetAllSubmissionsForAdminUseCase';
import { GetSubmissionDetailForAdminUseCase } from '../../application/usecases/submissions/admin/GetSubmissionDetailForAdminUseCase';
import { AdminSubmissionController } from '../../presentation/http/controllers/admin/AdminSubmissionController';
import { AdminBadgeController } from '../../presentation/http/controllers/admin/AdminBadgeController';






const httpServer = createServer();
container.registerInstance('HttpServer', httpServer);

//  Register Dependencies  //
// ----------------------- //
container.registerSingleton("IUserRepository", MongoUserRepository);
container.registerSingleton("IOtpRepository", RedisOtpRepository);
container.registerSingleton("ITokenService", JwtService);
container.registerSingleton("IS3Service", S3Service);

container.registerSingleton("IPasswordService", PasswordService);
container.registerSingleton("IEmailService", NodemailerEmailService);
container.registerSingleton("IUsernameService", UsernameService);
container.registerSingleton("IOAuthService", OAuthService);
container.registerSingleton("IContestTimerService", ContestTimerService);
container.registerSingleton("IContestScoringService", ContestScoringService);
container.registerSingleton("ICodeExecutionHelperService", CodeExecutionHelperService);
container.registerSingleton("IImageUploadService", ImageUploadService);
container.registerSingleton("IJudge0HealthService", Judge0HealthService);
container.registerSingleton("IProfileImageMigrationService", ProfileImageMigrationService);
container.registerSingleton("IUserStatsService", UserStatsService);
container.registerSingleton("IPostSubmissionHandler", PostSubmissionHandler);
container.registerSingleton("ISubmissionDistributionService", SubmissionDistributionService);
container.registerSingleton("IDistributionCacheService", DistributionCacheService);

container.registerSingleton("ICoinTransactionRepository", MongoCoinTransactionRepository)
container.registerSingleton("IUserProfileRepository", MongoUserProfileRepository)
container.registerSingleton("IPaymentGatewayService", RazorpayGatewayService)
container.registerSingleton("ICoinPurchaseRepository", MongoCoinPurchaseRepository)
container.registerSingleton("ICoinService", CoinPricingService)


container.registerSingleton("IContestRepository", MongoContestRepository)
container.registerSingleton("IContestParticipantRepository", MongoContestParticipantRepository)
container.registerSingleton("IProblemRepository", MongoProblemRepository)
container.registerSingleton("ITestCaseRepository", MongoTestCaseRepository)
container.registerSingleton("ISubmissionRepository", MongoSubmissionRepository)
container.registerSingleton("ICodeExecutionService", Judge0Service)
container.registerSingleton("ICounterRepository", MongoCounterRepository)
container.registerSingleton("IUserConnectionRepository", MongoUserConnectionRepository)
container.registerSingleton("IBadgeRepository", MongoBadgeRepository)


container.registerSingleton('IRoomRepository', MongoRoomRepository)

container.registerSingleton('IRoomActivityRepository', MongoRoomActivityRepository)

container.registerSingleton('IStoreItemRepository', MongoStoreItemRepository)
container.registerSingleton('IUserInventoryRepository', MongoUserInventoryRepository)

container.registerSingleton('IRealtimeService', SocketService)
container.registerSingleton('IPushSubscriptionRepository', MongoPushSubscriptionRepository)
container.registerSingleton('IWebPushService', WebPushService)


//   Register Use Cases  //
// --------------------- //
container.registerSingleton("ISignupUseCase", SignupUseCase);
container.registerSingleton("ILoginUseCase", LoginUseCase);
container.registerSingleton("IValidateUserUseCase", ValidateUserUseCase);
container.registerSingleton("IOtpUseCase", OtpUseCase);
container.registerSingleton("IForgotPasswordUseCase", ForgotPasswordUseCase);
container.registerSingleton("IChangePasswordUseCase", ChangePasswordUseCase);
container.registerSingleton("IGoogleOAuthUseCase", GoogleOAuthUseCase);
container.registerSingleton("IGitHubOAuthUseCase", GitHubOAuthUseCase);

container.registerSingleton("IGetProblemsListUseCase", GetProblemsListUseCase)
container.registerSingleton("IGetProblemByIdUseCase", GetProblemByIdUseCase)
container.registerSingleton("ICreateSubmissionUseCase", CreateSubmissionUseCase)
container.registerSingleton("IGetSubmissionResultUseCase", GetSubmissionResultUseCase)
container.registerSingleton("IRunCodeUseCase", RunCodeUseCase)
container.registerSingleton("IGetLanguagesUseCase", GetLanguagesUseCase)
container.registerSingleton("IGetUserSubmissionHistoryUseCase", GetUserSubmissionHistoryUseCase)
container.registerSingleton("IGetProblemNamesUseCase", GetProblemNamesUseCase)
container.registerSingleton("IGetListPageDataUseCase", GetListPageDataUseCase)
container.registerSingleton("ICreateProblemUseCase", CreateProblemUseCase)

container.registerSingleton("IRegisterForContestUseCase", RegisterForContestUseCase);
container.registerSingleton("IStartContestProblemUseCase", StartContestProblemUseCase);
container.registerSingleton("IGetContestLeaderboardUseCase", GetContestLeaderboardUseCase);
container.registerSingleton("IGetContestsListUseCase", GetContestsListUseCase);
container.registerSingleton("IGetContestDetailUseCase", GetContestDetailUseCase);
container.registerSingleton("ISubmitContestSolutionUseCase", SubmitContestSolutionUseCase);
container.registerSingleton("ICreateSubmissionUseCase", CreateSubmissionUseCase)
container.registerSingleton("IDistributeContestRewardsUseCase", DistributeContestRewardsUseCase)

container.registerSingleton("ICreateCoinPurchaseOrderUseCase", CreateCoinPurchaseOrderUseCase)
container.registerSingleton("ICompleteCoinPurchaseUseCase", CompleteCoinPurchaseUseCase)
container.registerSingleton("IGetCoinBalanceUseCase", GetCoinBalanceUseCase)
container.registerSingleton("IGetCoinTransactionsUseCase", GetCoinTransactionsUseCase)
container.registerSingleton("IGetCoinStatsUseCase", GetCoinStatsUseCase)
container.registerSingleton("IHandleRazorpayWebhookUseCase", HandleRazorpayWebhookUseCase)

container.registerSingleton("IUpdateUserProfileUseCase", UpdateUserProfileUseCase)
container.registerSingleton("IGetUserEditableProfile", GetUserEditableProfile)
container.registerSingleton("IGenerateProfileImageUploadUrlUseCase", GenerateProfileImageUploadUrlUseCase)
container.registerSingleton("IUpdateProfileImageUseCase", UpdateProfileImageUseCase)

container.registerSingleton('ICreateRoomUseCase', CreateRoomUseCase)
container.registerSingleton('IJoinRoomUseCase', JoinRoomUseCase)
container.registerSingleton('IGetPublicRoomsUseCase', GetPublicRoomsUseCase)
container.registerSingleton('IUpdateRoomPermissionsUseCase', UpdateRoomPermissionsUseCase)
container.registerSingleton('IKickUserUseCase', KickUserUseCase)
container.registerSingleton('IVerifyPrivateRoomUseCase', VerifyPrivateRoomUseCase)
container.registerSingleton('IRoomSubmitCodeUseCase', RoomSubmitCodeUseCase)
container.registerSingleton('IGetAllRoomsForAdminUseCase', GetAllRoomsForAdminUseCase)

container.registerSingleton('IGetStoreItemsUseCase', GetStoreItemsUseCase)
container.registerSingleton('IPurchaseStoreItemUseCase', PurchaseStoreItemUseCase)
container.registerSingleton('IGetUserInventoryUseCase', GetUserInventoryUseCase)
container.registerSingleton('ICheckItemOwnershipUseCase', CheckItemOwnershipUseCase)
container.registerSingleton('IUseTimeTravelTicketUseCase', UseTimeTravelTicketUseCase)
container.registerSingleton('IGetMissedDaysUseCase', GetMissedDaysUseCase)
container.registerSingleton('IUpdateStoreItemUseCase', UpdateStoreItemUseCase)
container.registerSingleton('IToggleStoreItemActiveUseCase', ToggleStoreItemActiveUseCase)
container.registerSingleton('IGetAllStoreItemsForAdminUseCase', GetAllStoreItemsForAdminUseCase)
container.registerSingleton('ICreateContestUseCase', CreateContestUseCase)
container.registerSingleton('IGetAdminActiveContestsUseCase', GetAdminActiveContestsUseCase)
container.registerSingleton('IGetAdminUpcomingContestsUseCase', GetAdminUpcomingContestsUseCase)
container.registerSingleton('IGetAdminPastContestsUseCase', GetAdminPastContestsUseCase)
container.registerSingleton('IGetAdminContestByIdUseCase', GetAdminContestByIdUseCase)
container.registerSingleton('IUpdateContestUseCase', UpdateContestUseCase)
container.registerSingleton('IDeleteContestUseCase', DeleteContestUseCase)
container.registerSingleton('IGetAllProblemsForAdminUseCase', GetAllProblemsForAdminUseCase)
container.registerSingleton('IGetAllProgrammingLanguages', GetAllProgrammingLanguages)
container.registerSingleton('IGetProblemDetailForAdminUseCase', GetProblemDetailForAdminUseCase)
container.registerSingleton('IGetProblemTestCasesForAdminUseCase', GetProblemTestCasesForAdminUseCase);
container.registerSingleton("IUpdateProblemUseCase", UpdateProblemUseCase);
container.registerSingleton("IUpdateTestCaseUseCase", UpdateTestCaseUseCase);
container.registerSingleton("IAddTestCaseUseCase", AddTestCaseUseCase);
container.registerSingleton("IDeleteTestCaseUseCase", DeleteTestCaseUseCase);
container.registerSingleton("IDeleteProblemUseCase", DeleteProblemUseCase);

container.registerSingleton("IGenerateImageUploadUrlUseCase", GenerateImageUploadUrlUseCase);
container.registerSingleton("IConfirmImageUploadUseCase", ConfirmImageUploadUseCase);

container.registerSingleton("IGetAllUsersUseCase", GetAllUsersUseCase);
container.registerSingleton("IGetUserProfileForUserUseCase", GetUserProfileUseCase);
container.registerSingleton("IGetUserDetailForAdminUseCase", GetUserDetailForAdminUseCase);

container.registerSingleton('IBlockUserUseCase', BlockUserUseCase);
container.registerSingleton('IGetUserContestDataUseCase', GetUserContestDataUseCase);
container.registerSingleton('IGetUserSubmissionDataUseCase', GetUserSubmissionDataUseCase);
container.registerSingleton('IGetUserFinancialDataUseCase', GetUserFinancialDataUseCase);
container.registerSingleton('IGetUserStoreDataUseCase', GetUserStoreDataUseCase);
container.registerSingleton('IGetUserRoomDataUseCase', GetUserRoomDataUseCase);
container.registerSingleton('IResetUserPasswordUseCase', ResetUserPasswordUseCase);
container.registerSingleton('ISendMailToUserUseCase', SendMailToUserUseCase);
container.registerSingleton('IGetAdminCoinPurchasesUseCase', GetAdminCoinPurchasesUseCase);
container.registerSingleton('IGetAdminCoinPurchaseDetailUseCase', GetAdminCoinPurchaseDetailUseCase);
container.registerSingleton('IReconcileCoinPurchaseUseCase', ReconcileCoinPurchaseUseCase);
container.registerSingleton('IRefundCoinPurchaseUseCase', RefundCoinPurchaseUseCase);
container.registerSingleton('IAddNoteToPurchaseUseCase', AddNoteToPurchaseUseCase);
container.registerSingleton('IAwardCoinsUseCase', AwardCoinsUseCase);

container.registerSingleton('ISubscribeToPushUseCase', SubscribeToPushUseCase);
container.registerSingleton('IUnsubscribeFromPushUseCase', UnsubscribeFromPushUseCase);
container.registerSingleton('ISendAdminNotificationUseCase', SendAdminNotificationUseCase);
container.registerSingleton('ISendUserNotificationUseCase', SendUserNotificationUseCase);

container.registerSingleton('IGetAllSubmissionsForAdminUseCase', GetAllSubmissionsForAdminUseCase);
container.registerSingleton('IGetSubmissionDetailForAdminUseCase', GetSubmissionDetailForAdminUseCase);
container.registerSingleton('IAdminListBadgesUseCase', ListAdminBadgesUseCase);
container.registerSingleton('IAdminGetBadgeDetailUseCase', GetAdminBadgeDetailUseCase);
container.registerSingleton('IAdminUpdateBadgeUseCase', UpdateAdminBadgeUseCase);
container.registerSingleton('IAdminToggleBadgeStatusUseCase', ToggleAdminBadgeStatusUseCase);
container.registerSingleton('IAdminListBadgeHoldersUseCase', ListBadgeHoldersUseCase);


//   Register Controllers  //
// ----------------------- //
container.registerSingleton(AuthController);
container.registerSingleton(UserCoinController)
container.registerSingleton(UserContestController)
container.registerSingleton(AdminProblemController)
container.registerSingleton(UserProfileController)
container.registerSingleton(UserStoreController)
container.registerSingleton(HealthController)
container.registerSingleton(AdminContestController)

container.registerSingleton(ImageServiceController)
container.registerSingleton(AdminUserController)
container.registerSingleton(AdminRoomController)
container.registerSingleton(RazorpayWebhookController)
container.registerSingleton(AdminCoinController)
container.registerSingleton(NotificationController)
container.registerSingleton(AdminSubmissionController)
container.registerSingleton(AdminBadgeController)


export { container };

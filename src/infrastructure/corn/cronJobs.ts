import { ContestTimerService } from "../../application/services/ContestTimerService"
import { DistributeContestRewardsUseCase } from "../../application/usecases/contests/DistributeContestRewardsUseCase"
import { MongoCoinTransactionRepository } from "../db/MongoCoinTransactionRepository"
import { MongoContestParticipantRepository } from "../db/MongoContestParticipantRepository"
import { MongoContestRepository } from "../db/MongoContestRepository"
import { MongoUserProfileRepository } from "../db/MongoUserProfileRepository"
import { MongoPushSubscriptionRepository } from "../db/MongoPushSubscriptionRepository"
import { WebPushService } from "../services/WebPushService"
import { ContestCron } from "./ContestCron"

const contestRepository = new MongoContestRepository()
const coinTransactionRepository = new MongoCoinTransactionRepository()
const userProfileRepository = new MongoUserProfileRepository()
const contestParticipantRepository = new MongoContestParticipantRepository()
const pushSubscriptionRepository = new MongoPushSubscriptionRepository()
const webPushService = new WebPushService()

const distributeContestRewardsUseCase = new DistributeContestRewardsUseCase(coinTransactionRepository, userProfileRepository, contestRepository, contestParticipantRepository)

const contestTimerService = new ContestTimerService(
  contestRepository, 
  distributeContestRewardsUseCase,
  pushSubscriptionRepository,
  webPushService,
  contestParticipantRepository
)

export const cornjob = new ContestCron(contestTimerService)

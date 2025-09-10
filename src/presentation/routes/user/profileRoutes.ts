

import { Router } from 'express';
import { UserProfileController } from '../..***REMOVED***';
import { UserSocialController } from '../../controllers/users/UserSocialController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { GetUserProfileUseCase } from '../../..***REMOVED***leUseCase';
import { UpdateUserProfileUseCase } from '../../..***REMOVED***ofileUseCase';
import { MongoUserRepository } from '../../../infrastructure/db/MongoUserRepository';
import { MongoUserProfileRepository } from '../../..***REMOVED***itory';
import { MongoUserConnectionRepository } from '../../..***REMOVED***pository';
import { FollowUserUseCase } from '../../..***REMOVED***eCase';
import { UnfollowUserUseCase } from '../../..***REMOVED***UseCase';
import { GetUserFollowersUseCase } from '../../..***REMOVED***wersUseCase';
import { GetUserFollowingUseCase } from '../../..***REMOVED***wingUseCase';
import { GetUserEditableProfile } from '../../..***REMOVED***bleProfile';




const userRepository = new MongoUserRepository()

const userProfileRepository = new MongoUserProfileRepository()

const userConnectionRepository = new MongoUserConnectionRepository()

const getUserEditableProfile = new GetUserEditableProfile(userRepository, userProfileRepository)

const getUserProfileUseCase = new GetUserProfileUseCase(userRepository, userProfileRepository, userConnectionRepository)

const updateUserProfileUseCase = new UpdateUserProfileUseCase(userProfileRepository, getUserProfileUseCase)

const userProfileController = new UserProfileController(getUserProfileUseCase, updateUserProfileUseCase, getUserEditableProfile, userRepository)






const followUserUseCase = new FollowUserUseCase(userConnectionRepository, userRepository)

const unfollowUserUseCase = new UnfollowUserUseCase(userConnectionRepository)

const getUserFollowersUseCase = new GetUserFollowersUseCase(userConnectionRepository, userRepository)

const getUserFollowingUseCase = new GetUserFollowingUseCase(userConnectionRepository, userRepository)

const userSocialController = new UserSocialController(followUserUseCase, unfollowUserUseCase, getUserFollowersUseCase, getUserFollowingUseCase)



const router = Router();




router.get('/', authMiddleware(), (req, res) => userProfileController.getProfile(req, res));

router.get('/profile/:userId', userProfileController.getProfile.bind(userProfileController));

router.get('/u/:username', userProfileController.getPublicProfile.bind(userProfileController));

router.get('/profile', authMiddleware(), (req, res) => userProfileController.getEditProfile(req, res));

router.put('/profile', authMiddleware(), (req, res) => userProfileController.updateProfile(req, res));



router.post('/follow', authMiddleware, userSocialController.followUser.bind(userSocialController));

router.delete('/unfollow', authMiddleware, userSocialController.unfollowUser.bind(userSocialController));

router.get('/followers/:userId', userSocialController.getFollowers.bind(userSocialController));

router.get('/following/:userId', userSocialController.getFollowing.bind(userSocialController));




export default router;

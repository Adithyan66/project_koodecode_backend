

import { Router } from 'express';
import { UserProfileController } from '../../controllers/users/UserProfileController';
import { UserSocialController } from '../../controllers/users/UserSocialController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { GetUserProfileUseCase } from '../../../application/usecases/users/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../../../application/usecases/users/UpdateUserProfileUseCase';
import { MongoUserRepository } from '../../../infrastructure/db/MongoUserRepository';
import { MongoUserProfileRepository } from '../../../infrastructure/db/MongoUserProfileRepository';
import { MongoUserConnectionRepository } from '../../../infrastructure/db/MongoUserConnectionRepository';
import { FollowUserUseCase } from '../../../application/usecases/users/FollowUserUseCase';
import { UnfollowUserUseCase } from '../../../application/usecases/users/UnfollowUserUseCase';
import { GetUserFollowersUseCase } from '../../../application/usecases/users/GetUserFollowersUseCase';
import { GetUserFollowingUseCase } from '../../../application/usecases/users/GetUserFollowingUseCase';
import { GetUserEditableProfile } from '../../../application/usecases/users/GetUserEditableProfile';




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

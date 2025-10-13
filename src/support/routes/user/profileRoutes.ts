

import { Router } from 'express';
import { UserProfileController } from '../../../support/controllers/users/UserProfileController';

import { UserSocialController } from '../../../support/controllers/users/UserSocialController';
import { authMiddleware } from '../../../support/middleware/authMiddleware';
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

import { GenerateProfileImageUploadUrlUseCase } from '../../../application/usecases/users/GenerateProfileImageUploadUrlUseCase';
import { ImageUploadService } from '../../../application/services/ImageUploadService';
import { S3Service } from '../../../infrastructure/services/S3Service';
import { UpdateProfileImageUseCase } from '../../../application/usecases/users/UpdateProfileImageUseCase';
import { ProfileImageController } from '../../../support/controllers/users/ProfileImageController';




const userRepository = new MongoUserRepository()

const userProfileRepository = new MongoUserProfileRepository()

const userConnectionRepository = new MongoUserConnectionRepository()

const getUserEditableProfile = new GetUserEditableProfile(userRepository, userProfileRepository)

const getUserProfileUseCase = new GetUserProfileUseCase(userRepository, userProfileRepository, userConnectionRepository)

const updateUserProfileUseCase = new UpdateUserProfileUseCase(userProfileRepository, getUserProfileUseCase, userRepository)

const userProfileController = new UserProfileController(getUserProfileUseCase, updateUserProfileUseCase, getUserEditableProfile, userRepository)


const s3Service = new S3Service()

const imageUploadService = new ImageUploadService(s3Service)

const generateProfileImageUploadUrlUseCase = new GenerateProfileImageUploadUrlUseCase(imageUploadService)

const updateProfileImageUseCase = new UpdateProfileImageUseCase(userRepository, imageUploadService)

const profileImageController = new ProfileImageController(generateProfileImageUploadUrlUseCase, updateProfileImageUseCase)




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



// router.post('/follow', authMiddleware, userSocialController.followUser.bind(userSocialController));

// router.delete('/unfollow', authMiddleware, userSocialController.unfollowUser.bind(userSocialController));

// router.get('/followers/:userId', userSocialController.getFollowers.bind(userSocialController));

// router.get('/following/:userId', userSocialController.getFollowing.bind(userSocialController));



router.post('/upload-url', authMiddleware(), (req, res) => profileImageController.generateUploadUrl(req, res));

router.post('/confirm-upload', authMiddleware(), (req, res) => profileImageController.confirmUpload(req, res));



export default router;

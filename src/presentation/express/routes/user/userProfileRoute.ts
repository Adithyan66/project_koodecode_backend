



import { Router } from 'express';
import { authMiddleware } from '../../../../support/middleware/authMiddleware';
import { UserProfileController } from '../../../http/controllers/user/UserProfileController';
import { container } from 'tsyringe';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';



const router = Router();

const userProfileController = container.resolve(UserProfileController)


router.get('/', authMiddleware(), expressAdapter(userProfileController.getProfile))

router.get('/profile/:userId', expressAdapter(userProfileController.getProfile));

router.get('/u/:username', expressAdapter(userProfileController.getPublicProfile));

router.get('/profile', authMiddleware(), expressAdapter(userProfileController.getEditProfile));

router.put('/profile', authMiddleware(), expressAdapter(userProfileController.updateProfile));

router.post('/upload-url', authMiddleware(), expressAdapter(userProfileController.generateUploadUrl));

router.post('/confirm-upload', authMiddleware(), expressAdapter(userProfileController.confirmUpload));



export default router;

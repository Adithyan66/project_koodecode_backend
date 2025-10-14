



import { Router } from 'express';
import { UserProfileController } from '../../../http/controllers/user/UserProfileController';
import { container } from 'tsyringe';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { authenticate } from '../../middlewares';



const router = Router();

const userProfileController = container.resolve(UserProfileController)


router.get('/', authenticate, expressAdapter(userProfileController.getProfile))
router.get('/profile/:userId', expressAdapter(userProfileController.getProfile));
router.get('/u/:username', expressAdapter(userProfileController.getPublicProfile));
router.get('/profile', authenticate, expressAdapter(userProfileController.getEditProfile));
router.put('/profile', authenticate, expressAdapter(userProfileController.updateProfile));
router.post('/upload-url', authenticate, expressAdapter(userProfileController.generateUploadUrl));
router.post('/confirm-upload', authenticate, expressAdapter(userProfileController.confirmUpload));



export default router;

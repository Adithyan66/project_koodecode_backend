



import { Router } from 'express';
import { container } from 'tsyringe';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { UserRoomController } from '../../../http/controllers/user/UserRoomController';
import { authenticate } from '../../middlewares';



const router = Router();

const userRoomController = container.resolve(UserRoomController)



router.post('/create', authenticate, expressAdapter(userRoomController.createRoom));
router.post('/:roomId/join', authenticate, expressAdapter(userRoomController.joinRoom));
router.get('/public', authenticate, expressAdapter(userRoomController.getPublicRooms));
router.put('/:roomId/permissions', authenticate, expressAdapter(userRoomController.updatePermissions));
router.delete('/:roomId/participants/:userId', authenticate, expressAdapter(userRoomController.kickUser));
router.get('/problem-names', authenticate, expressAdapter(userRoomController.kickUser));
router.post('/verify-private', authenticate, expressAdapter(userRoomController.validateRoom));


export default router;

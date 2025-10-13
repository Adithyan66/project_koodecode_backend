



import { Router } from 'express';
import { authMiddleware } from '../../../../support/middleware/authMiddleware';
import { container } from 'tsyringe';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { UserRoomController } from '../../../http/controllers/user/UserRoomController';



const router = Router();

const userRoomController = container.resolve(UserRoomController)



router.post('/create', authMiddleware(), expressAdapter(userRoomController.createRoom));

router.post('/:roomId/join', authMiddleware(), expressAdapter(userRoomController.joinRoom));

router.get('/public', authMiddleware(), expressAdapter(userRoomController.getPublicRooms));

router.put('/:roomId/permissions', authMiddleware(), expressAdapter(userRoomController.updatePermissions));

router.delete('/:roomId/participants/:userId', authMiddleware(), expressAdapter(userRoomController.kickUser));

router.get('/problem-names', authMiddleware(), expressAdapter(userRoomController.kickUser));

router.post('/verify-private', authMiddleware(), expressAdapter(userRoomController.validateRoom));


export default router;

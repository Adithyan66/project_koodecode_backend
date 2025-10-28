import { Router } from 'express';
import { expressAdapter } from '../../../adaptors/ExpressAdaptor';
import { container } from "../../../../infrastructure/config/container";
import { AdminRoomController } from '../../../http/controllers/admin/AdminRoomController';
import { adminOnly } from '../../middlewares';

const router = Router();
const adminRoomController = container.resolve(AdminRoomController);

router.get('/', adminOnly, expressAdapter(adminRoomController.getAllRooms));

export default router;


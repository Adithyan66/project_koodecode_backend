import { Router } from 'express';
import { RoomController } from '../../controllers/users/rooms/RoomController';
import { authMiddleware } from '../../middleware/authMiddleware';


import { MongoRoomRepository } from '../../../infrastructure/db/MongoRoomRepository';
import { MongoRoomActivityRepository } from '../../../infrastructure/db/MongoRoomActivityRepository';
import { MongoCounterRepository } from '../../../infrastructure/db/MongoCounterRepository';
import { MongoProblemRepository } from '../../../infrastructure/db/MongoProblemRepository';
import { MongoUserRepository } from '../../../infrastructure/db/MongoUserRepository';
import { JwtService } from '../../../infrastructure/services/JwtService';

import { CreateRoomUseCase } from '../../../application/usecases/rooms/CreateRoomUseCase';
import { JoinRoomUseCase } from '../../../application/usecases/rooms/JoinRoomUseCase';
import { GetPublicRoomsUseCase } from '../../../application/usecases/rooms/GetPublicRoomsUseCase';
import { UpdateRoomPermissionsUseCase } from '../../../application/usecases/rooms/UpdateRoomPermissionsUseCase';
import { KickUserUseCase } from '../../../application/usecases/rooms/KickUserUseCase';

const router = Router();

const roomRepository = new MongoRoomRepository();
const roomActivityRepository = new MongoRoomActivityRepository();
const counterRepository = new MongoCounterRepository();
const problemRepository = new MongoProblemRepository();
const userRepository = new MongoUserRepository();
const tokenService = new JwtService();

const createRoomUseCase = new CreateRoomUseCase(
    roomRepository,
    counterRepository,
    problemRepository,
    userRepository
);

const joinRoomUseCase = new JoinRoomUseCase(
    roomRepository,
    problemRepository,
    userRepository,
    roomActivityRepository,
    tokenService
);

const getPublicRoomsUseCase = new GetPublicRoomsUseCase(
    roomRepository,
    userRepository,
    problemRepository
);

const updateRoomPermissionsUseCase = new UpdateRoomPermissionsUseCase(
    roomRepository,
    roomActivityRepository
);

const kickUserUseCase = new KickUserUseCase(
    roomRepository,
    roomActivityRepository
);

const roomController = new RoomController(
    createRoomUseCase,
    joinRoomUseCase,
    getPublicRoomsUseCase,
    updateRoomPermissionsUseCase,
    kickUserUseCase
);

router.post('/create', authMiddleware(), (req, res) => roomController.createRoom(req, res));

router.post('/:roomId/join', authMiddleware(), (req, res) => roomController.joinRoom(req, res));

router.get('/public', authMiddleware(), (req, res) => roomController.getPublicRooms(req, res));

router.put('/:roomId/permissions', authMiddleware(), (req, res) => roomController.updatePermissions(req, res));

router.delete('/:roomId/participants/:userId', authMiddleware(), (req, res) => roomController.kickUser(req, res));



export default router;

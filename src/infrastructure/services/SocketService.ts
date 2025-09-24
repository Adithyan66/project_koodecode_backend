import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { IRoomRepository } from '../../domain/interfaces/repositories/IRoomRepository';
import { IProblemRepository } from '../../domain/interfaces/repositories/IProblemRepository';
import { IRoomActivityRepository } from '../../domain/interfaces/repositories/IRoomActivityRepository';
import { config } from '../config/config';

export class SocketService {
    private io: SocketIOServer;

    constructor(
        server: HttpServer,
        private roomRepository: IRoomRepository,
        private problemRepository: IProblemRepository,
        private roomActivityRepository: IRoomActivityRepository
    ) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: config.socket.cors.origin,
                methods: ['GET', 'POST']
            }
        });

        this.setupMiddleware();
        this.setupEventHandlers();
    }

    private setupMiddleware(): void {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;

                if (!token) {
                    return next(new Error('Authentication error'));
                }

                const decoded = jwt.verify(token, config.jwt.secret) as any;

                if (decoded.type !== 'socket') {
                    return next(new Error('Invalid token type'));
                }

                // Verify room exists and user has access
                const room = await this.roomRepository.findByRoomId(decoded.roomId);
                if (!room) {
                    return next(new Error('Room not found'));
                }

                const participant = room.participants.find(p => p.userId === decoded.userId);
                if (!participant) {
                    return next(new Error('User not in room'));
                }

                socket.data.userId = decoded.userId;
                socket.data.roomId = decoded.roomId;
                socket.data.permissions = participant.permissions;

                next();
            } catch (error) {
                next(new Error('Authentication error'));
            }
        });
    }

    private setupEventHandlers(): void {
        this.io.on('connection', (socket) => {
            const { userId, roomId } = socket.data;

            // Join room
            socket.join(`room_${roomId}`);
            socket.join(`room_${roomId}_code`);
            socket.join(`room_${roomId}_board`);

            // Update user online status
            this.updateUserOnlineStatus(roomId, userId, true);

            // Notify others that user joined
            socket.to(`room_${roomId}`).emit('user-joined', {
                userId,
                timestamp: new Date()
            });

            // Handle problem change
            socket.on('change-problem', async (data: { problemNumber: number }) => {
                if (!socket.data.permissions.canChangeProblem) {
                    socket.emit('error', { message: 'No permission to change problem' });
                    return;
                }

                try {
                    const problem = await this.problemRepository.findByProblemNumber(data.problemNumber);
                    if (!problem) {
                        socket.emit('error', { message: 'Problem not found' });
                        return;
                    }

                    // Update room problem
                    const room = await this.roomRepository.findByRoomId(roomId);
                    if (room) {
                        await this.roomRepository.update(room.id, { problemNumber: data.problemNumber });
                    }

                    // Save/Load existing code for this problem
                    const existingCode = await this.roomRepository.getRoomCode(roomId);
                    
                    let codeToSend = problem.templates.userFunctionSignature || '';

                    if (existingCode && existingCode.problemNumber === data.problemNumber) {
                        codeToSend = existingCode.code;
                    }

                    // Broadcast problem change to all users in room
                    this.io.to(`room_${roomId}`).emit('problem-changed', {
                        problem,
                        code: codeToSend,
                        language: problem.supportedLanguages || 'javascript',
                        changedBy: userId,
                        timestamp: new Date()
                    });

                    // Log activity
                    await this.roomActivityRepository.create({
                        roomId,
                        userId,
                        action: 'problem_changed',
                        details: { problemNumber: data.problemNumber },
                        timestamp: new Date()
                    });
                } catch (error) {
                    socket.emit('error', { message: 'Failed to change problem' });
                }
            });

            // Handle code updates
            socket.on('code-update', async (data: { code: string; language: string; problemNumber: number }) => {
                if (!socket.data.permissions.canEditCode) {
                    socket.emit('error', { message: 'No permission to edit code' });
                    return;
                }

                try {
                    // Save code to database
                    await this.roomRepository.saveRoomCode({
                        roomId,
                        problemNumber: data.problemNumber,
                        code: data.code,
                        language: data.language,
                        lastModified: new Date(),
                        lastModifiedBy: userId
                    });

                    // Broadcast to other users
                    socket.to(`room_${roomId}_code`).emit('code-changed', {
                        code: data.code,
                        language: data.language,
                        changedBy: userId,
                        timestamp: new Date()
                    });

                } catch (error) {
                    socket.emit('error', { message: 'Failed to save code' });
                }
            });

            // Handle whiteboard updates
            socket.on('whiteboard-update', (data: any) => {
                if (!socket.data.permissions.canDrawWhiteboard) {
                    socket.emit('error', { message: 'No permission to draw on whiteboard' });
                    return;
                }

                // Broadcast to other users in the room
                socket.to(`room_${roomId}_board`).emit('whiteboard-changed', {
                    ...data,
                    changedBy: userId,
                    timestamp: new Date()
                });
            });

            // Handle permission updates
            socket.on('update-permissions', async (data: { targetUserId: string; permissions: any }) => {
                const room = await this.roomRepository.findByRoomId(roomId);

                if (!room || room.createdBy !== userId) {
                    socket.emit('error', { message: 'Only room creator can update permissions' });
                    return;
                }

                try {
                    // Update permissions in database
                    const updatedPermissions = { ...room.permissions };

                    // Update based on new permissions
                    Object.keys(data.permissions).forEach(permission => {
                        if (data.permissions[permission]) {
                            if (!updatedPermissions[permission].includes(data.targetUserId)) {
                                updatedPermissions[permission].push(data.targetUserId);
                            }
                        } else {
                            updatedPermissions[permission] = updatedPermissions[permission].filter(
                                id => id !== data.targetUserId
                            );
                        }
                    });

                    await this.roomRepository.updatePermissions(roomId, updatedPermissions);

                    // Notify all users about permission change
                    this.io.to(`room_${roomId}`).emit('permissions-updated', {
                        targetUserId: data.targetUserId,
                        permissions: data.permissions,
                        updatedBy: userId,
                        timestamp: new Date()
                    });

                    // Log activity
                    await this.roomActivityRepository.create({
                        roomId,
                        userId,
                        action: 'permissions_updated',
                        details: { targetUserId: data.targetUserId, permissions: data.permissions },
                        timestamp: new Date()
                    });

                } catch (error) {
                    socket.emit('error', { message: 'Failed to update permissions' });
                }
            });

            // Handle user kick
            socket.on('kick-user', async (data: { targetUserId: string; reason?: string }) => {
                const room = await this.roomRepository.findByRoomId(roomId);

                if (!room || room.createdBy !== userId) {
                    socket.emit('error', { message: 'Only room creator can kick users' });
                    return;
                }

                if (data.targetUserId === userId) {
                    socket.emit('error', { message: 'Cannot kick yourself' });
                    return;
                }

                try {
                    // Remove user from room
                    await this.roomRepository.removeParticipant(roomId, data.targetUserId);

                    // Disconnect the kicked user's socket
                    const socketsInRoom = await this.io.in(`room_${roomId}`).fetchSockets();
                    const targetSocket = socketsInRoom.find(s => s.data.userId === data.targetUserId);
                    if (targetSocket) {
                        targetSocket.emit('kicked', { reason: data.reason });
                        targetSocket.disconnect();
                    }

                    // Notify other users
                    socket.to(`room_${roomId}`).emit('user-kicked', {
                        targetUserId: data.targetUserId,
                        reason: data.reason,
                        kickedBy: userId,
                        timestamp: new Date()
                    });

                    // Log activity
                    await this.roomActivityRepository.create({
                        roomId,
                        userId,
                        action: 'user_kicked',
                        details: { kickedUserId: data.targetUserId, reason: data.reason },
                        timestamp: new Date()
                    });

                } catch (error) {
                    socket.emit('error', { message: 'Failed to kick user' });
                }
            });

            // Handle disconnect
            socket.on('disconnect', async () => {
                // Update user offline status
                await this.updateUserOnlineStatus(roomId, userId, false);

                // Notify others that user left
                socket.to(`room_${roomId}`).emit('user-left', {
                    userId,
                    timestamp: new Date()
                });

                // Log activity
                await this.roomActivityRepository.create({
                    roomId,
                    userId,
                    action: 'left',
                    timestamp: new Date()
                });

                // Check if room should be marked inactive
                await this.checkRoomActivity(roomId);
            });
        });
    }

    private async updateUserOnlineStatus(roomId: string, userId: string, isOnline: boolean): Promise<void> {
        try {
            await this.roomRepository.updateParticipantStatus(roomId, userId, isOnline);
        } catch (error) {
            console.error('Failed to update user online status:', error);
        }
    }

    private async checkRoomActivity(roomId: string): Promise<void> {
        try {
            const room = await this.roomRepository.findByRoomId(roomId);
            if (!room) return;

            const onlineParticipants = room.participants.filter(p => p.isOnline);

            if (onlineParticipants.length === 0) {
                // Mark room as inactive after 1 minute delay
                setTimeout(async () => {
                    const updatedRoom = await this.roomRepository.findByRoomId(roomId);
                    if (updatedRoom) {
                        const stillOnline = updatedRoom.participants.filter(p => p.isOnline);
                        if (stillOnline.length === 0) {
                            await this.roomRepository.update(updatedRoom.id, { status: 'inactive' });
                        }
                    }
                }, 60000); // 1 minute
            }
        } catch (error) {
            console.error('Failed to check room activity:', error);
        }
    }
}

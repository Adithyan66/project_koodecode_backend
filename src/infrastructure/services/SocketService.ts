import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { IRoomRepository } from '../../domain/interfaces/repositories/IRoomRepository';
import { IProblemRepository } from '../../domain/interfaces/repositories/IProblemRepository';
import { IRoomActivityRepository } from '../../domain/interfaces/repositories/IRoomActivityRepository';
import { config } from '../config/config';
import { ITestCaseRepository } from '../../domain/interfaces/repositories/ITestCaseRepository';
import { IRealtimeService } from '../../domain/interfaces/services/IRealtimeService';
import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';



@injectable()
export class SocketService implements IRealtimeService {

    private io!: SocketIOServer;

    constructor(
        @inject('IRoomRepository') private roomRepository: IRoomRepository,
        @inject('IProblemRepository') private problemRepository: IProblemRepository,
        @inject('IRoomActivityRepository') private roomActivityRepository: IRoomActivityRepository,
        @inject('ITestCaseRepository') private testCaseRepository: ITestCaseRepository,
        @inject("IUserRepository") private userRepository: IUserRepository,
    ) {

    }

    initialize(server: HttpServer): void {
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

                const room = await this.roomRepository.findByRoomId(decoded.roomId);

                if (!room) {
                    return next(new Error('Room not found'));
                }

                const participant = room.participants.find(p => p.userId.toString() == decoded.userId);

                if (!participant) {
                    return next(new Error('User not in room'));
                }


                socket.data.userId = decoded.userId;
                socket.data.roomId = decoded.roomId;
                const isCreator = room.createdBy.toString() === decoded.userId;
                const globalPermissions = {
                    canEditCode: isCreator || room.permissions.canEditCode.some(id => id.toString() === decoded.userId),
                    canDrawWhiteboard: isCreator || room.permissions.canDrawWhiteboard.some(id => id.toString() === decoded.userId),
                    canChangeProblem: isCreator || room.permissions.canChangeProblem.some(id => id.toString() === decoded.userId)
                };

                console.log("Permissions for user", decoded.userId, ":", globalPermissions);
                socket.data.permissions = globalPermissions;

                next();
            } catch (error) {
                // console.log("thi is tojken", error);
                next(new Error('Authentication error'));
            }
        });
    }

    private setupEventHandlers(): void {

        this.io.on('connection', async (socket) => {

            const { userId, roomId } = socket.data;

            socket.join(`room_${roomId}`);
            socket.join(`room_${roomId}_code`);
            socket.join(`room_${roomId}_board`);

            this.updateUserOnlineStatus(roomId, userId, true);

            const userDetails = await this.userRepository.findById(userId)

            // Notify others that user joined
            socket.to(`room_${roomId}`).emit('user-joined', {
                userId,
                username: userDetails?.userName,
                fullName: userDetails?.fullName,
                email: userDetails?.email,
                profilePicKey: userDetails?.profilePicKey,
                timestamp: new Date()
            });

            socket.on('change-problem', async (data: { problemNumber: number }) => {
              
                
                const roomData = await this.roomRepository.findByRoomId(roomId)
                if (!roomData?.permissions?.canChangeProblem.some(id => id.toString() === userId)) {
                    socket.emit('error', { message: 'No permission to change problem' });
                    return;
                }


                try {
                    const problem = await this.problemRepository.findByProblemNumber(data.problemNumber);
                    if (!problem) {
                        socket.emit('error', { message: 'Problem not found' });
                        return;
                    }
                    const sampleTestCases = await this.testCaseRepository.findSampleByProblemId(problem.id!)

                    // Update room problem
                    const room = await this.roomRepository.findByRoomId(roomId);
                    if (room) {
                        await this.roomRepository.update(room.id, { problemNumber: data.problemNumber });
                    }

                    // Save/Load existing code for this problem
                    const existingCode = await this.roomRepository.getRoomCode(roomId);

                    let codeToSend = problem.templates[Object.keys(problem.templates)[0]].userFunctionSignature || 'onnulll';


                    if (existingCode && existingCode.problemNumber === data.problemNumber) {
                        codeToSend = existingCode.code;
                    }

                    // Broadcast problem change to all users in room
                    this.io.to(`room_${roomId}`).emit('problem-changed', {
                        problem: {
                            ...problem,
                            sampleTestCases
                        },
                        code: codeToSend,
                        language: existingCode?.language || 'javascript',
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

                const roomData = await this.roomRepository.findByRoomId(roomId)
                if (!roomData?.permissions?.canEditCode.some(id => id.toString() === userId)) {
                    socket.emit('error', { message: 'No permission to edit code' });
                    return;
                }


                try {
                    // console.log("✅ Permission check passed, saving code...");

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

                    // console.log("✅ Broadcast completed");

                } catch (error) {
                    console.error("❌ Failed to save code:", error);
                    socket.emit('error', { message: 'Failed to save code' });
                }
            });


            // Add this in your setupEventHandlers method
            socket.on('test-event', (data) => {
          
                socket.emit('test-response', { message: 'Hello from backend!' });
            });


            // Handle whiteboard updates
            socket.on('whiteboard-update', async (data: any) => {

                const roomData = await this.roomRepository.findByRoomId(roomId)
                if (!roomData?.permissions?.canDrawWhiteboard.some(id => id.toString() === userId)) {
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



            // Handle chat messages
            socket.on('send-message', async (data: {
                content: string;
                type: 'text' | 'code';
                language?: string
            }) => {
               
                try {
                    // Get user details for the message
                    const room = await this.roomRepository.findByRoomId(roomId);
                    if (!room) {
                        socket.emit('error', { message: 'Room not found' });
                        return;
                    }

                    const participant = room.participants.find(p => p.userId.toString() === userId);
                    if (!participant) {
                        socket.emit('error', { message: 'User not in room' });
                        return;
                    }

                    const user = await this.userRepository.findById(userId)

                    // Create message object
                    const message = {
                        id: Date.now().toString() + '_' + userId,
                        userId,
                        username: participant.username,
                        profilePicture: user?.profilePicKey || null,
                        content: data.content,
                        type: data.type,
                        language: data.language,
                        timestamp: new Date()
                    };

                    console.log("✅ Broadcasting message to room:", `room_${roomId}`);

                    // Broadcast to all users in room (including sender)
                    this.io.to(`room_${roomId}`).emit('message-received', message);

                    // console.log("✅ Message broadcast completed");

                    // Log activity
                    await this.roomActivityRepository.create({
                        roomId,
                        userId,
                        action: 'message_sent',
                        details: {
                            messageType: data.type,
                            contentLength: data.content.length
                        },
                        timestamp: new Date()
                    });

                } catch (error) {
                    console.error("❌ Failed to send message:", error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // Handle typing indicators
            socket.on('typing-start', async () => {
                const user = await this.userRepository.findById(userId)
                socket.to(`room_${roomId}`).emit('user-typing', {
                    userId,
                    username: user?.userName || 'Unknown',
                    isTyping: true
                });
            });
            
            socket.on('typing-stop',async () => {
                const user = await this.userRepository.findById(userId)
                socket.to(`room_${roomId}`).emit('user-typing', {
                    userId,
                    username: user?.userName || 'Unknown',
                    isTyping: false
                });
            });

            socket.on('update-permissions', async (data: { targetUserId: string; permissions: any }) => {
                console.log("receivedddddddddddddddddddddd", data);

                const room = await this.roomRepository.findByRoomId(roomId);

                if (!room || room.createdBy.toString() !== userId) {
                    socket.emit('error', { message: 'Only room creator can update permissions' });
                    return;
                }

                try {
                    const updatedPermissions = { ...room.permissions };

                    Object.keys(data.permissions).forEach(permission => {
                        if (permission in updatedPermissions) {
                            const key = permission as 'canEditCode' | 'canDrawWhiteboard' | 'canChangeProblem';
                            if (data.permissions[permission]) {
                                if (!updatedPermissions[key].includes(data.targetUserId)) {
                                    updatedPermissions[key].push(data.targetUserId);
                                }
                            } else {
                                updatedPermissions[key] = updatedPermissions[key].filter(
                                    id => id.toString() !== data.targetUserId
                                );
                            }
                        }
                    });

                    await this.roomRepository.updatePermissions(roomId, updatedPermissions);

                    this.io.to(`room_${roomId}`).emit('permissions-updated', {
                        targetUserId: data.targetUserId,
                        permissions: data.permissions,
                        updatedBy: userId,
                        timestamp: new Date()
                    });

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
                    await this.roomRepository.addKickedUser(roomId, data.targetUserId);

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

            socket.on('unkick-user', async (data: { targetUserId: string }) => {
                const room = await this.roomRepository.findByRoomId(roomId);

                if (!room || room.createdBy !== userId) {
                    socket.emit('error', { message: 'Only room creator can unkick users' });
                    return;
                }

                try {
                    await this.roomRepository.removeKickedUser(roomId, data.targetUserId);

                    this.io.to(`room_${roomId}`).emit('user-unkicked', {
                        targetUserId: data.targetUserId,
                        updatedBy: userId,
                        timestamp: new Date()
                    });

                    await this.roomActivityRepository.create({
                        roomId,
                        userId,
                        action: 'user_unkicked',
                        details: { targetUserId: data.targetUserId },
                        timestamp: new Date()
                    });
                } catch (error) {
                    socket.emit('error', { message: 'Failed to unkick user' });
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

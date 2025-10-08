

// src/application/dto/rooms/PublicRoomsDto.ts
export interface PublicRoomCreator {
    id: string;
    username: string;
    avatar?: string;
}

export interface PublicRoomDto {
    id: string;
    roomId: string;
    roomNumber: number;
    name: string;
    description: string;
    thumbnail?: string;
    participantCount: number;
    status: 'active' | 'waiting';
    scheduledTime?: Date;
    createdBy: PublicRoomCreator;
    createdAt: Date;
}

export interface PublicRoomsResponseDto {
    success: boolean;
    rooms: PublicRoomDto[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasMore: boolean;
    };
    error?: string;
}

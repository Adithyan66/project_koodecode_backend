

export interface PublicRoomCreator {
    id: string;
    fullName: string;
    email: string;
    userName: string;
    profilePicUrl: string;
}

export interface PublicRoomDto {
    id: string;
    roomId: string;
    roomNumber: number;
    name: string;
    description: string;
    thumbnail?: string;
    participantCount: number;
    status: 'waiting' | 'active' | 'inactive';
    scheduledTime?: Date;
    createdBy: PublicRoomCreator;
    createdAt: Date;
}

export interface PublicRoomsResponseDto {
    rooms: PublicRoomDto[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasMore: boolean;
    };
    error?: string;
}

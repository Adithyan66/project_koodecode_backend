export class UserConnection {
    constructor(
        public followerId: string,
        public followingId: string,
        public status: ConnectionStatus = ConnectionStatus.ACTIVE,
        public createdAt: Date = new Date(),
        public id?: string,
    ) {}
}

export enum ConnectionStatus {
    ACTIVE = "active",
    BLOCKED = "blocked",
    PENDING = "pending"
}

export class UserSocialStats {
    constructor(
        public userId: string,
        public followersCount: number = 0,
        public followingCount: number = 0,
        public profileViews: number = 0,
        public updatedAt: Date = new Date(),
    ) {}
}



export interface FollowUserDto {
    targetUserId: string;
}

export interface FollowUserResponseDto {
    success: boolean;
    message: string;
    isFollowing: boolean;
}

export interface UserConnectionDto {
    userId: string;
    userName: string;
    fullName: string;
    profilePicUrl?: string;
    followedAt: string;
}

export interface UserFollowersResponseDto {
    followers: UserConnectionDto[];
    followersCount: number;
}

export interface UserFollowingResponseDto {
    following: UserConnectionDto[];
    followingCount: number;
}

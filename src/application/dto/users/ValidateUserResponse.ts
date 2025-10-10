

export interface ValidateUserResponse {
    success: boolean;
    user?: {
        id: string;
        fullName: string;
        userName: string;
        email: string;
        isAdmin: boolean;
        profilePicUrl?: string;
    };
    message: string;
}

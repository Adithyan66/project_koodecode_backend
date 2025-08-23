export class LoginUserResponse {
    constructor(
        public user: {
            fullName: string;
            userName: string;
            email: string;
            isAdmin: boolean;
            profilePicUrl?: string;
            accessToken: string,
            refreshToken: string
        }
    ) { }
}

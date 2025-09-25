export class SignupUserResponse {
  
  constructor(
     public user: {
            [x: string]: any;
            fullName: string;
            userName: string;
            email: string;
            isAdmin: boolean;
            // profilePicUrl?: string;
            accessToken: string,
            refreshToken: string
        }
  ) {}
}

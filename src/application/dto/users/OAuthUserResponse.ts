import { SafeUser } from "./safeUser";



export interface OAuthUserResponse {
  user: SafeUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  isNewUser: boolean;
}

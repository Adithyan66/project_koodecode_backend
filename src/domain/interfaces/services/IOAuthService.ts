

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google" | "github";
}

export interface IOAuthService {
  verifyGoogleToken(token: string): Promise<OAuthProfile>;
  verifyGithubToken(code: string): Promise<OAuthProfile>;
}

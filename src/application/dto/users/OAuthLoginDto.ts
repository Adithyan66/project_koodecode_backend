

export interface OAuthLoginDto {
  token?: string;  // for Google
  code?: string;   // for GitHub
  provider: "google" | "github";
}

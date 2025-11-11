



export interface UserProps {
  fullName: string;
  userName: string;
  email: string;
  role?: "user" | "admin";
  profilePicUrl?: string;
  id?: string;
  fps: string;
  passwordHash?: string;
  profilePicKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
  googleId?: string;
  githubId?: string;
  provider?: "email" | "google" | "github";
  emailVerified?: boolean;
  isBlocked: boolean;
}

export class User {
  public fullName: string;
  public userName: string;
  public email: string;
  public role: "user" | "admin";
  public profilePicUrl?: string;
  public id?: string;
  public fps: string;
  public passwordHash?: string;
  public profilePicKey?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public googleId?: string;
  public githubId?: string;
  public provider: "email" | "google" | "github";
  public emailVerified: boolean;
  public isBlocked: boolean;

  constructor(props: UserProps) {
    this.fullName = props.fullName;
    this.userName = props.userName;
    this.email = props.email;
    this.role = props.role ?? "user";
    this.profilePicUrl = props.profilePicUrl;
    this.id = props.id;
    this.fps = props.fps;
    this.passwordHash = props.passwordHash;
    this.profilePicKey = props.profilePicKey;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.googleId = props.googleId;
    this.githubId = props.githubId;
    this.provider = props.provider ?? "email";
    this.emailVerified = props.emailVerified ?? (props.provider !== "email");
    this.isBlocked = props.isBlocked;
  }




}

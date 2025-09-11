


// export class User {
//     constructor(
//         public fullName: string,
//         public userName: string,
//         public email: string,
//         public role: "user" | "admin" = "user",
//         public profilePicUrl?: string,
//         public id?: string,
//         public passwordHash?: string,
//         public profilePicKey?: string,
//         public createdAt?: Date,
//         public updatedAt?: Date,
//     ) { }
// }




export interface UserProps {
  fullName: string;
  userName: string;
  email: string;
  role?: "user" | "admin";
  profilePicUrl?: string;
  id?: string;
  passwordHash?: string;
  profilePicKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public fullName: string;
  public userName: string;
  public email: string;
  public role: "user" | "admin";
  public profilePicUrl?: string;
  public id?: string;
  public passwordHash?: string;
  public profilePicKey?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(props: UserProps) {
    this.fullName = props.fullName;
    this.userName = props.userName;
    this.email = props.email;
    this.role = props.role ?? "user";
    this.profilePicUrl = props.profilePicUrl;
    this.id = props.id;
    this.passwordHash = props.passwordHash;
    this.profilePicKey = props.profilePicKey;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}

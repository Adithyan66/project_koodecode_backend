


export class User {
    constructor(
        public fullName: string,
        public userName: string,
        public email: string,
        public role: "user" | "admin" = "user",
        public profilePicUrl?: string,
        public id?: string,
        public passwordHash?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
    ) {}
}

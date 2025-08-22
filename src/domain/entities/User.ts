export class User {
    constructor(
        public fullName: string,
        public userName: string,
        public email: string,
        public passwordHash: string,
        public isAdmin: boolean
    ) { }
}

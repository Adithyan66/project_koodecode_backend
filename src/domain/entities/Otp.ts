export interface OtpProps {
    code: number;
    email: string;
    expiresAt: Date;
    meta?: Record<string, any>;
}

export class Otp {
    private readonly code: number;
    private readonly email: string;
    private readonly expiresAt: Date;
    private readonly meta?: Record<string, any>;

    constructor({
        code,
        email,
        expiresAt,
        meta
    }: OtpProps) {
        this.code = code;
        this.email = email;
        this.expiresAt = expiresAt;
        this.meta = meta;
    }

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isValid(inputCode: number): boolean {
        if (this.isExpired()) return false;

        return this.code === inputCode;
    }

    getEmail(): string {
        return this.email;
    }
}

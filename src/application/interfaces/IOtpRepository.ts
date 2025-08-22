export interface IOtpRepository {
    saveOtp(email: string, data: object, ttlSeconds: number): Promise<void>;
    getOtp(email: string): Promise<{ username: string; fullname: string; otp: number } | null>;
    deleteOtp(email: string): Promise<void>;
}

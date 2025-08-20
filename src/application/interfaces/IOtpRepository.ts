export interface IOtpRepository {
    saveOtp(email: string, data: object, ttlSeconds: number): Promise<void>;
    getOtp(email: string): Promise<string | null>;
    deleteOtp(email: string): Promise<void>;
}

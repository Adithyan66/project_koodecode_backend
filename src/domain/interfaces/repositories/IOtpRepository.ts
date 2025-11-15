

export interface IOtpRepository {
  saveOtp(email: string, data: Record<string, any>, ttlSeconds: number): Promise<void>;
  getOtp(email: string): Promise<Record<string, any> | null>;
  deleteOtp(email: string): Promise<void>;
}

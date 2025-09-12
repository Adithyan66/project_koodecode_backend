// export interface IOtpRepository {
//     saveOtp(email: string, data: object, ttlSeconds: number): Promise<void>;
//     getOtp(email: string): Promise<{ username?: string; fullname?: string; otp: number } | null>;
//     deleteOtp(email: string): Promise<void>;
// }




// domain/interfaces/repositories/IOtpRepository.ts
export interface IOtpRepository {
  saveOtp(email: string, data: Record<string, any>, ttlSeconds: number): Promise<void>;
  getOtp(email: string): Promise<Record<string, any> | null>;
  deleteOtp(email: string): Promise<void>;
}

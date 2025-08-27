import { TokenPayload } from "../../shared/types/TokenPayload";


export interface ITokenService {

  generateAccessToken(payload: object): string;
  
  generateRefreshToken(payload: object): string;

  verifyAccessToken(token: string): object | null;
  
  verifyRefreshToken(token: string): TokenPayload | null;

  blacklistToken(token: string, exp: number): Promise<void>;
  
  isBlacklisted(token: string): Promise<boolean>;
}

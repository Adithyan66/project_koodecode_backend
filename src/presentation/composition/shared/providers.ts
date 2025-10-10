import { PasswordService } from "../../../application/services/PasswordService";
import { JwtService } from "../../../infrastructure/services/JwtService";
import { NodemailerEmailService } from "../../../infrastructure/services/NodemailerEmailService";



export const nodeMailerService = new NodemailerEmailService()
export const passwordService = new PasswordService()
export const jwtService = new JwtService()


import { IUsernameService } from "../../domain/interfaces/services/IUsernameService";

export class UsernameService implements IUsernameService {
    generate(name: string, email: string): string {
        const baseName = name.toLowerCase().replace(/\s+/g, '');
        const emailPrefix = email.split('@')[0];
        const randomSuffix = Math.floor(Math.random() * 1000);
        return `${baseName || emailPrefix}${randomSuffix}`;
    }
}

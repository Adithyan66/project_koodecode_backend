

import { IJudge0Service } from '../../interfaces/IJudge0Service';
import { Judge0Language } from '../../../domain/entities/Judge0Submission';

export class GetLanguagesUseCase {
  constructor(private judge0Service: IJudge0Service) {}

  async execute(): Promise<Judge0Language[]> {
    try {
      const languages = await this.judge0Service.getLanguages();
      return languages.filter(lang => this.isSupportedLanguage(lang.id));
    } catch (error) {
      throw new Error(`Failed to get languages: ${error.message}`);
    }
  }

  private isSupportedLanguage(languageId: number): boolean {
    const supportedLanguages = [50, 54, 62, 71, 63, 78, 72, 73]; 
    return supportedLanguages.includes(languageId);
  }
}

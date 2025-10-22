export class ProgrammingLanguage {

  private static readonly SUPPORTED_LANGUAGES: Record<number, { name: string; extension: string }> = {
    50: { name: 'C', extension: 'c' },
    54: { name: 'C++', extension: 'cpp' },
    62: { name: 'Java', extension: 'java' },
    63: { name: 'JavaScript', extension: 'js' },
    71: { name: 'Python', extension: 'py' },
    78: { name: 'Kotlin', extension: 'kt' },
    83: { name: 'Swift', extension: 'swift' },
    51: { name: 'C#', extension: 'cs' },
    60: { name: 'Go', extension: 'go' },
    72: { name: 'Ruby', extension: 'rb' }
  };

  constructor(private readonly _id?: number) {
    if (_id && !ProgrammingLanguage.isSupported(_id)) {
      throw new Error(`Unsupported programming language ID: ${_id}`);
    }
  }

  static isSupported(languageId: number): boolean {
    return languageId in this.SUPPORTED_LANGUAGES;
  }

  static getLanguageInfo(languageId: number): { name: string; extension: string } | null {
    return this.SUPPORTED_LANGUAGES[languageId] || null;
  }

  get getAllSupportedLanguages(): Record<number, { name: string; extension: string }> {
    return { ...ProgrammingLanguage.SUPPORTED_LANGUAGES };
  }

  get name(): string {
    if (!this._id) {
      throw new Error(`id not provided`);
    }
    return ProgrammingLanguage.SUPPORTED_LANGUAGES[this._id].name;
  }

  get extension(): string {
    if (!this._id) {
      throw new Error(`id not provided`);
    }
    return ProgrammingLanguage.SUPPORTED_LANGUAGES[this._id].extension;
  }

  get id(): number {
    if (!this._id) {
      throw new Error(`id not provided`);
    }
    return this._id;
  }
}

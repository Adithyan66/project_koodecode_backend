

// import { ICodeExecutionService } from '../../../domain/interfaces/services/IJudge0Service';
// import { Judge0Language } from '../../../domain/entities/Judge0Submission';
// import { inject, injectable } from 'tsyringe';


// @injectable()
// export class GetLanguagesUseCase {

//   constructor(
//     @inject("ICodeExecutionService") private _codeExecutionService: ICodeExecutionService
//   ) { }


//   async execute(): Promise<Judge0Language[]> {

//     try {

//       const languages = await this._codeExecutionService.getLanguages();

//       return languages.filter(lang => this.isSupportedLanguage(lang.id));

//     } catch (error) {

//       console.log(error);

//       throw new Error(`Failed to get languages`);
//     }
//   }

//   private isSupportedLanguage(languageId: number): boolean {

//     const supportedLanguages = [50, 54, 62, 71, 63, 78, 72, 73];

//     return supportedLanguages.includes(languageId);
//   }
// }
























import { ICodeExecutionService } from '../../../domain/interfaces/services/IJudge0Service';
import { Judge0Language } from '../../../domain/entities/Judge0Submission';
import { ProgrammingLanguage } from '../../../domain/value-objects/ProgrammingLanguage';
import { NoSupportedLanguagesError, LanguageServiceUnavailableError } from '../../../domain/errors/ProblemErrors';
import { inject, injectable } from 'tsyringe';

@injectable()
export class GetLanguagesUseCase {
  constructor(
    @inject("ICodeExecutionService") private _codeExecutionService: ICodeExecutionService
  ) {}

  async execute(): Promise<Judge0Language[]> {
    try {
      const languages = await this._codeExecutionService.getLanguages();
      
      const supportedLanguages = languages.filter(lang => {
        try {
          new ProgrammingLanguage(lang.id);
          return true;
        } catch (error) {
          return false;
        }
      });

      if (supportedLanguages.length === 0) {
        throw new NoSupportedLanguagesError();
      }

      return supportedLanguages;

    } catch (error) {
      if (error instanceof NoSupportedLanguagesError) {
        throw error;
      }
      
      throw new LanguageServiceUnavailableError("Judge0");
    }
  }
}

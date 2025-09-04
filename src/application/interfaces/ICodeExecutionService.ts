// import { TestResult } from '../../domain/entities/Submission';

// export interface ICodeExecutionService {
//     executeCode(
//         code: string, 
//         language: string, 
//         testCases: any[]
//     ): Promise<TestResult[]>;
    
//     validateSyntax(code: string, language: string): Promise<boolean>;
    
//     getSupportedLanguages(): string[];
// }
import { TestCaseResult } from '../../domain/entities/Submission';

export interface ICodeExecutionService {
    executeCode(
        code: string, 
        language: string, 
        testCases: any[]
    ): Promise<TestCaseResult[]>;
    
    validateSyntax(code: string, language: string): Promise<boolean>;
    
    getSupportedLanguages(): string[];
}

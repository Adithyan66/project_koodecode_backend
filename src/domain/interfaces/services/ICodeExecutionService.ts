
import { TestCaseResult } from "../../entities/Submission";

export interface ICodeExecutionService {
    executeCode(
        code: string, 
        language: string, 
        testCases: any[]
    ): Promise<TestCaseResult[]>;
    
    validateSyntax(code: string, language: string): Promise<boolean>;
    
    getSupportedLanguages(): string[];
}

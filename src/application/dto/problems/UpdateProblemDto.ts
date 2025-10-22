

export interface UpdateProblemDto {
    title?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    description?: string;
    constraints?: string[];
    examples?: any;
    testCases?: {
        input: any;
        expectedOutput: any;
        isSample: boolean;
        explanation?: string;
    }[];
    hints?: string[];
    companies?: string[];
    isActive?: boolean;
}

export interface UpdateProblemPayload {
  // Basic Information
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isActive?: boolean;
  
  // Function Definition
  functionName?: string;
  returnType?: string;
  parameters?: Parameter[];
  
  // Arrays
  tags?: string[];
  hints?: string[];
  companies?: string[];
  supportedLanguages?: number[];
  
  // Complex Objects
  constraints?: ProblemConstraint[];
  examples?: ProblemExample[];
  templates?: Record<number, LanguageTemplate>;
}

export interface Parameter {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface ProblemConstraint {
  parameterName: string;
  type: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  _id?: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation: string;
  isSample: boolean;
}

export interface LanguageTemplate {
  userFunctionSignature: string;
  templateCode: string;
  placeholder: string;
}

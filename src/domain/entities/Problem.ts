


export interface Constraint {
  parameterName: string;
  type: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

export interface Example {
  input: string;
  output: string;
  explanation: string;
  isSample?: boolean;
}

export interface Parameter {
  name: string;
  type: string;
  description?: string;
}

export interface Template {
  templateCode: string;
  userFunctionSignature: string;
  placeholder: string;
}

export interface ProblemProps {
  problemNumber: number;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  description: string;
  constraints: Constraint[];
  examples: Example[];
  likes?: string[];
  totalSubmissions?: number;
  acceptedSubmissions?: number;
  hints?: string[];
  companies?: string[];
  isActive?: boolean;
  createdBy: string;
  functionName: string;
  returnType: string;
  parameters: Parameter[];
  supportedLanguages: number[];
  templates: Record<string, Template>;

  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Problem {
  public problemNumber: number;
  public title: string;
  public slug: string;
  public difficulty: 'easy' | 'medium' | 'hard';
  public tags: string[];
  public description: string;
  public constraints: Constraint[];
  public examples: Example[];
  public likes: string[];
  public totalSubmissions: number;
  public acceptedSubmissions: number;
  public hints: string[];
  public companies: string[];
  public isActive: boolean;
  public createdBy: string;
  public functionName: string;
  public returnType: string;
  public parameters: Parameter[];
  public supportedLanguages: number[];
  public templates: Record<string, Template>;

  public id?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor({
    problemNumber,
    title,
    slug,
    difficulty,
    tags,
    description,
    constraints,
    examples,
    likes = [],
    totalSubmissions = 0,
    acceptedSubmissions = 0,
    hints = [],
    companies = [],
    isActive = true,
    createdBy,
    functionName,
    returnType,
    parameters,
    supportedLanguages,
    templates,
    id,
    createdAt,
    updatedAt,
  }: ProblemProps) {
    this.problemNumber = problemNumber;
    this.title = title;
    this.slug = slug;
    this.difficulty = difficulty;
    this.tags = tags;
    this.description = description;
    this.constraints = constraints;
    this.examples = examples;
    this.likes = likes;
    this.totalSubmissions = totalSubmissions;
    this.acceptedSubmissions = acceptedSubmissions;
    this.hints = hints;
    this.companies = companies;
    this.isActive = isActive;
    this.createdBy = createdBy;
    this.functionName = functionName;
    this.returnType = returnType;
    this.parameters = parameters;
    this.supportedLanguages = supportedLanguages;
    this.templates = templates;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get acceptanceRate(): number {
    return this.totalSubmissions > 0
      ? Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100)
      : 0;
  }

  static isValidProblemNumber(problemNumber: number): boolean {
    return problemNumber > 0 && Number.isInteger(problemNumber);
  }

  toggleActive(): void {
    this.isActive = !this.isActive;
  }

  addLike(userId: string): void {
    if (!this.likes.includes(userId)) {
      this.likes.push(userId);
    }
  }

  removeLike(userId: string): void {
    this.likes = this.likes.filter(id => id !== userId);
  }

  addSupportedLanguage(languageId: number, template: Template): void {
    if (!this.supportedLanguages.includes(languageId)) {
      this.supportedLanguages.push(languageId);
      this.templates[languageId.toString()] = template;
      this.updatedAt = new Date();
    }
  }

  removeSupportedLanguage(languageId: number): void {
    this.supportedLanguages = this.supportedLanguages.filter(id => id !== languageId);
    delete this.templates[languageId.toString()];
    this.updatedAt = new Date();
  }

  updateTemplate(languageId: number, template: Template): void {
    if (this.supportedLanguages.includes(languageId)) {
      this.templates[languageId.toString()] = template;
      this.updatedAt = new Date();
    }
  }

  getTemplate(languageId: number): Template | undefined {
    return this.templates[languageId.toString()];
  }
}



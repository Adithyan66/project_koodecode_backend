

import { Problem } from '../../../domain/entities/Problem';
import { TestCase } from '../../../domain/entities/TestCase';
import { IProblemRepository } from '../../../domain/interfaces/repositories/IProblemRepository';
import { ITestCaseRepository } from '../../../domain/interfaces/repositories/ITestCaseRepository';
import { CreateProblemDto } from '../../dto/problems/CreateProblemDto';
import { ICounterRepository } from '../../../domain/interfaces/repositories/ICounterRepository';



export class CreateProblemUseCase {

  constructor(
    private problemRepository: IProblemRepository,
    private testCaseRepository: ITestCaseRepository,
    private counterRepository: ICounterRepository
  ) { }


  async execute(data: CreateProblemDto, adminId: string): Promise<Problem> {


    const slug = this.generateSlug(data.title);

    const existingProblem = await this.problemRepository.findBySlug(slug);

    if (existingProblem) {
      throw new Error(`Problem with title "${data.title}" already exists`);
    }

    if (!data.testCases || data.testCases.length === 0) {
      throw new Error('At least one test case is required');
    }

    const sampleTestCases = data.testCases.filter(tc => tc.isSample);
    if (sampleTestCases.length === 0) {
      throw new Error('At least one sample test case is required');
    }


    const problemNumber = await this.counterRepository.getNextSequenceValue('problemNumber');


    const transformedExamples = data.examples.map(example => ({
      input: JSON.stringify(example.inputs),
      output: example.expectedOutput,
      explanation: example.explanation,
      isSample: true
    }));

    const transformedParameters = data.parameters.map(param => ({
      name: param.name,
      type: param.type,
      description: param.description
    }));

    const problem = new Problem({
      problemNumber,
      title: data.title,
      slug,
      difficulty: data.difficulty,
      tags: data.tags,
      description: data.description,
      constraints: data.constraints,
      examples: transformedExamples,
      likes: [], // default, can omit
      totalSubmissions: 0, // default, can omit
      acceptedSubmissions: 0, // default, can omit
      hints: data.hints || [],
      companies: data.companies || [],
      isActive: true, // default, can omit
      createdBy: adminId,
      functionName: data.functionName,
      returnType: data.returnType,
      parameters: transformedParameters,
    });

    const savedProblem = await this.problemRepository.create(problem);


    const testCases = data.testCases.map(tc =>
      TestCase.createTestCase(
        savedProblem.id!,
        tc.inputs,
        tc.expectedOutput,
        tc.isSample,
      )
    );

    await this.testCaseRepository.createMany(testCases);

    return savedProblem;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
}

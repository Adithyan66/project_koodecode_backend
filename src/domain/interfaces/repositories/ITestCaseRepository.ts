

import { TestCase } from '../../entities/TestCase';

export interface ITestCaseRepository {
    create(testCase: TestCase): Promise<TestCase>;
    createMany(testCases: TestCase[]): Promise<TestCase[]>;
    findByProblemId(problemId: string): Promise<TestCase[]>;
    findSampleByProblemId(problemId: string): Promise<TestCase[]>;
    findNonSampleByProblemId(problemId: string): Promise<TestCase[]>;
    findById(id: string): Promise<TestCase | null>;
    update(id: string, testCase: Partial<TestCase>): Promise<TestCase | null>;
    delete(id: string): Promise<boolean>;
    deleteByProblemId(problemId: string): Promise<boolean>;
    countByProblemId(problemId: string): Promise<number>;

    countByProblemId(problemId: string): Promise<number>;

}

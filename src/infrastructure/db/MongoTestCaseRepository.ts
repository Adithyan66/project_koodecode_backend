

import { TestCase } from '../../domain/entities/TestCase';
import { ITestCaseRepository } from '../../domain/interfaces/repositories/ITestCaseRepository'; 
import { TestCaseModel, ITestCaseDocument } from './models/TestCaseModel';
import { Types } from 'mongoose';

export class MongoTestCaseRepository implements ITestCaseRepository {


    async create(testCase: TestCase): Promise<TestCase> {

        const testCaseDoc = new TestCaseModel({
            problemId: testCase.problemId,
            input: testCase.inputs,
            expectedOutput: testCase.expectedOutput,
            isSample: testCase.isSample,
        });

        const savedTestCase = await testCaseDoc.save();
        return this.mapToEntity(savedTestCase);
    }

    async createMany(testCases: TestCase[]): Promise<TestCase[]> {

        const testCaseDocs = testCases.map(tc => ({
            problemId: new Types.ObjectId(tc.problemId),
            inputs: tc.inputs,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample,
        }));        

        const savedTestCases = await TestCaseModel.insertMany(testCaseDocs);

        return savedTestCases.map(doc => this.mapToEntity(doc));
    }

    async findByProblemId(problemId: string): Promise<TestCase[]> {
        const testCases = await TestCaseModel.find({ problemId }).sort({ createdAt: 1 });
        return testCases.map(tc => this.mapToEntity(tc));
    }

    async findSampleByProblemId(problemId: string): Promise<TestCase[]> {

        const testCases = await TestCaseModel.find({
            problemId,
            isSample: true
        }).sort({ createdAt: 1 });
        
        return testCases.map(tc => this.mapToEntity(tc));
    }

    async findNonSampleByProblemId(problemId: string): Promise<TestCase[]> {
        const testCases = await TestCaseModel.find({
            problemId,
            isSample: false
        }).sort({ createdAt: 1 });
        return testCases.map(tc => this.mapToEntity(tc));
    }

    async findById(id: string): Promise<TestCase | null> {
        const testCase = await TestCaseModel.findById(id);
        return testCase ? this.mapToEntity(testCase) : null;
    }

    async update(id: string, updates: Partial<TestCase>): Promise<TestCase | null> {
        const testCase = await TestCaseModel.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true }
        );
        return testCase ? this.mapToEntity(testCase) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await TestCaseModel.findByIdAndDelete(id);
        return !!result;
    }

    async deleteByProblemId(problemId: string): Promise<boolean> {
        const result = await TestCaseModel.deleteMany({ problemId });
        return result.deletedCount > 0;
    }

    async countByProblemId(problemId: string): Promise<number> {
        return await TestCaseModel.countDocuments({ problemId });
    }

    private mapToEntity(doc: ITestCaseDocument): TestCase {
        return new TestCase(
            doc.problemId.toString(),
            doc.inputs,
            doc.expectedOutput,
            doc.isSample,
            doc._id.toString(),
            doc.createdAt,
            doc.updatedAt
        );
    }
}

import { TestCaseListRequestDto, TestCaseListResponseDto } from '../dto/problems/TestCaseListDto';
import { UpdateTestCasePayload } from '../dto/problems/UpdateTestCaseDto';
import { AddTestCasePayload } from '../dto/problems/AddTestCaseDto';

export interface IGetProblemTestCasesForAdminUseCase {
    execute(request: TestCaseListRequestDto): Promise<TestCaseListResponseDto>;
}

export interface IUpdateTestCaseUseCase {
    execute(slug: string, testCaseId: string, updateData: UpdateTestCasePayload, adminId: string): Promise<void>;
}

export interface IAddTestCaseUseCase {
    execute(slug: string, testCaseData: AddTestCasePayload, adminId: string): Promise<void>;
}

export interface IDeleteTestCaseUseCase {
    execute(slug: string, testCaseId: string, adminId: string): Promise<void>;
}

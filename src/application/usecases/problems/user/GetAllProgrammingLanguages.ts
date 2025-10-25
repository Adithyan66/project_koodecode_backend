



import { inject, injectable } from "tsyringe";
import { IGetAllProblemsForAdminUseCase, IGetAllProgrammingLanguages } from "../../../interfaces/IProblemUseCase";
import { IProblemRepository, ProblemSearchFilters } from "../../../../domain/interfaces/repositories/IProblemRepository";
import { ITestCaseRepository } from "../../../../domain/interfaces/repositories/ITestCaseRepository";
import { AdminProblemsListResponseDto, AdminProblemListDto, AdminProblemsListRequestDto } from "../../../dto/problems/AdminProblemListDto";
import { ProgrammingLanguage } from "../../../../domain/value-objects/ProgrammingLanguage";

@injectable()
export class GetAllProgrammingLanguages implements IGetAllProgrammingLanguages{

    constructor(
        
    ) { }

    async execute() {
        return new ProgrammingLanguage().getAllSupportedLanguages
      
    }
}
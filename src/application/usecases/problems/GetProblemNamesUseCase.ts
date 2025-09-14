import { IProblemRepository } from "../../../domain/interfaces/repositories/IProblemRepository";


export class GetProblemNamesUseCase {

    constructor(
        private problemRepository: IProblemRepository
    ) { }

    async execute(){

        const result = await this.problemRepository.getProblemNames()

        return result
    }
}
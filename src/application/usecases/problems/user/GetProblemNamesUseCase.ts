


import { inject, injectable } from 'tsyringe';
import { IProblemRepository } from '../../../../domain/interfaces/repositories/IProblemRepository';
import { ProblemNamesRequestDto, ProblemNamesResponseDto, ProblemNameDto } from '../../../dto/problems/ProblemNamesDto';
import { IGetProblemNamesUseCase } from '../../../interfaces/IProblemUseCase';


@injectable()
export class GetProblemNamesUseCase implements  IGetProblemNamesUseCase{

  constructor(
    @inject('IProblemRepository') private problemRepository: IProblemRepository
  ) { }

  async execute(request: ProblemNamesRequestDto): Promise<ProblemNamesResponseDto> {

    const page = Math.max(1, request.page || 1);
    const limit = Math.min(Math.max(1, request.limit || 10), 50);
    const search = request.search?.trim() || '';

    try {
      const result = await this.problemRepository.getProblemNames({
        page,
        limit,
        search
      });

      const totalPages = Math.ceil(result.totalCount / limit);
      const hasMore = page < totalPages;

      const problemDtos: ProblemNameDto[] = result.problems.map(problem => ({
        id: problem.id,
        problemNumber: problem.problemNumber,
        title: problem.title,
        difficulty: problem.difficulty,
        type: problem.type
      }));

      return {
        problems: problemDtos,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: result.totalCount,
          hasMore,
          limit
        }
      };
    } catch (error) {
      console.log(error)
      throw new Error(`Failed to get problem names: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

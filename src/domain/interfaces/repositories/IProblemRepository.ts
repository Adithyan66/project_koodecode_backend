

import { Problem } from '../../entities/Problem';



export interface ProblemFilters {
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
  tags?: string[];
  languageId?: number;
  status?: "Draft" | "Published";
  isActive?: boolean;
}



export interface PaginationOptions {
  page: number;
  limit: number;
}




export interface IProblemRepository {
    create(problem: Problem): Promise<Problem>;
    findById(id: string): Promise<Problem | null>;
    findByProblemNumber(problemNumber: number): Promise<Problem | null>;
    findAll(filters?: {
        difficulty?: 'easy' | 'medium' | 'hard';
        isActive?: boolean;
        name?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        problems: Problem[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, problem: Partial<Problem>): Promise<Problem | null>;
    delete(id: string): Promise<boolean>;
    findBySlug(slug: string): Promise<Problem | null>;

    // getFilteredProblems(
    //     filters: ProblemFilters,
    //     pagination: PaginationOptions
    // ): Promise<{
    //     problems: Problem[];
    //     total: number;
    //     currentPage: number;
    //     totalPages: number;
    //     hasNext: boolean;
    //     hasPrev: boolean;
    // }>;

    getFilteredProblems(
        filters: ProblemFilters,
        pagination: PaginationOptions
    ): Promise<{
        problems: Problem[];
        total: number;
    }>;

    getProblemNames(params: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<{
        problems: Array<{
            id: string;
            problemNumber: number;
            title: string;
            difficulty: 'easy' | 'medium' | 'hard';
        }>;
        totalCount: number;
    }>;


}





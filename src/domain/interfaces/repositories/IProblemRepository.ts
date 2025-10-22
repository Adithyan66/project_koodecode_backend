

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


export interface ProblemSearchFilters {
    search?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    status?: 'active' | 'inactive';
    page: number;
    limit: number;
    sortBy: 'problemNumber' | 'title' | 'difficulty' | 'createdAt' | 'acceptanceRate' | 'totalSubmissions';
    sortOrder: 'asc' | 'desc';
}

export interface PaginatedProblems {
    problems: Problem[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
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




    findAllForAdminWithFilters(filters: ProblemSearchFilters): Promise<PaginatedProblems>;
    getSubmissionStatsByProblemId(problemId: string): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
    }>;
    getOverallStats(): Promise<{
        totalProblems: number;
        activeCount: number;
        inactiveCount: number;
        easyCount: number;
        mediumCount: number;
        hardCount: number;
    }>;

    // Soft delete methods
    softDelete(id: string): Promise<boolean>;
    softDeleteBySlug(slug: string): Promise<boolean>;

}





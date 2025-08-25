export interface ProblemListDto {
    id: string;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    likes: number;
    acceptanceRate: number;
    totalSubmissions: number;
    isActive: boolean;
}

export interface ProblemListResponseDto {
    problems: ProblemListDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

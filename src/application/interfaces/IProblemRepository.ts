

import { Problem } from '../../domain/entities/Problem';

export interface IProblemRepository {
    create(problem: Problem): Promise<Problem>;
    findById(id: string): Promise<Problem | null>;
    findAll(filters?: {
        difficulty?: 'easy' | 'medium' | 'hard';
        tags?: string[];
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
}

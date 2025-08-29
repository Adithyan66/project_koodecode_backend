import { SortOrder } from 'mongoose';
import { IProblemRepository, PaginationOptions, ProblemFilters } from '../..***REMOVED***ry';
import { Problem } from '../../domain/entities/Problem';
import ProblemModel from './models/ProblemModel';

export class MongoProblemRepository implements IProblemRepository {

    async create(problem: Problem): Promise<Problem> {
        const problemDoc = new ProblemModel({
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            tags: problem.tags,
            description: problem.description,
            constraints: problem.constraints,
            examples: problem.examples,
            testCases: problem.testCases,
            likes: problem.likes,
            totalSubmissions: problem.totalSubmissions,
            acceptedSubmissions: problem.acceptedSubmissions,
            hints: problem.hints,
            companies: problem.companies,
            isActive: problem.isActive,
            createdBy: problem.createdBy
        });

        const saved = await problemDoc.save();
        return this.mapToDomain(saved);
    }

    async findById(id: string): Promise<Problem | null> {
        const problem = await ProblemModel.findById(id);
        return problem ? this.mapToDomain(problem) : null;
    }

    async findBySlug(slug: string): Promise<Problem | null> {
        const problem = await ProblemModel.findOne({ slug });
        return problem ? this.mapToDomain(problem) : null;
    }

    async findAll(filters: {
        difficulty?: 'easy' | 'medium' | 'hard';
        tags?: string[];
        isActive?: boolean;
        name?: string;  
        page?: number;
        limit?: number;
    } = {}): Promise<{
        problems: Problem[];
        total: number;
        page: number;
        limit: number;
    }> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const query: any = {};

        if (filters.difficulty) {
            query.difficulty = filters.difficulty;
        }

        if (filters.tags && filters.tags.length > 0) {
            query.tags = { $in: filters.tags };
        }

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

   
        if (filters.name && filters.name.trim()) {
            query.$text = { $search: filters.name.trim() };
        }

        const [problems, total] = await Promise.all([
            ProblemModel.find(query)
                .sort(filters.name ? { score: { $meta: "textScore" } } : { createdAt: -1 })  // Sort by relevance if searching
                .skip(skip)
                .limit(limit),
            ProblemModel.countDocuments(query)
        ]);

        return {
            problems: problems.map(p => this.mapToDomain(p)),
            total,
            page,
            limit
        };
    }

    async update(id: string, updateData: Partial<Problem>): Promise<Problem | null> {
        const updated = await ProblemModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        return updated ? this.mapToDomain(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await ProblemModel.findByIdAndDelete(id);
        return !!result;
    }

    private mapToDomain(doc: any): Problem {
        return new Problem(
            doc.title,
            doc.slug,
            doc.difficulty,
            doc.tags,
            doc.description,
            doc.constraints,
            doc.examples,
            doc.testCases,
            doc.likes,
            doc.totalSubmissions,
            doc.acceptedSubmissions,
            doc.hints,
            doc.companies,
            doc.isActive,
            doc.createdBy,
            doc._id.toString(),
            doc.createdAt,
            doc.updatedAt
        );
    }


    async getFilteredProblems(
        filters: ProblemFilters,
        pagination: PaginationOptions
    ): Promise<{
        problems: Problem[];
        total: number;
        currentPage: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }> {
        try {
            // Build MongoDB query
            const query: any = {};

            // Search functionality - searches in title and description
            if (filters.search) {
                query.$or = [
                    { title: { $regex: filters.search, $options: 'i' } },
                    { description: { $regex: filters.search, $options: 'i' } }
                ];
            }

            // Filter by difficulty
            if (filters.difficulty) {
                query.difficulty = filters.difficulty;
            }

            // Filter by category
            // if (filters.category) {
            //     query.category = filters.category;
            // }

            // Filter by tags
            // if (filters.tags && filters.tags.length > 0) {
            //     query.tags = { $in: filters.tags };
            // }

            // Filter by status (for published problems only for users)
            // if (filters.status) {
            //     query.status = filters.status;
            // } else {
            //     // Default to published problems for user requests
            //     query.status = 'Published';
            // }

            // Pagination
            const skip = (pagination.page - 1) * pagination.limit;

            // Sorting
            const sortField = pagination.sortBy || 'createdAt';
            const sortDirection = pagination.sortOrder === 'asc' ? 1 : -1;
            const sort = { [sortField]: sortDirection as SortOrder} ;

            // Execute queries in parallel
            const [problems, total] = await Promise.all([
                ProblemModel.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(pagination.limit)
                    .lean(),
                ProblemModel.countDocuments(query)
            ]);

            const totalPages = Math.ceil(total / pagination.limit);

            return {
                problems: problems.map(p => p as unknown as Problem),
                total,
                currentPage: pagination.page,
                totalPages,
                hasNext: pagination.page < totalPages,
                hasPrev: pagination.page > 1
            };
        } catch (error) {
            throw new Error(`Failed to fetch filtered problems: `);
        }
    }

}

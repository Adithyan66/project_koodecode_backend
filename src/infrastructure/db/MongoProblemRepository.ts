import { SortOrder } from 'mongoose';
import { Problem } from '../../domain/entities/Problem';
import ProblemModel from './models/ProblemModel';
import { IProblemRepository, PaginationOptions, ProblemFilters } from '../../domain/interfaces/repositories/IProblemRepository';



export class MongoProblemRepository implements IProblemRepository {


    async create(problem: Problem): Promise<Problem> {


        const problemDoc = new ProblemModel({
            problemNumber: problem.problemNumber,
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            tags: problem.tags,
            description: problem.description,
            constraints: problem.constraints,
            examples: problem.examples,
            likes: problem.likes,
            totalSubmissions: problem.totalSubmissions,
            acceptedSubmissions: problem.acceptedSubmissions,
            hints: problem.hints,
            companies: problem.companies,
            isActive: problem.isActive,
            createdBy: problem.createdBy,
            functionName: problem.functionName,
            returnType: problem.returnType,
            parameters: problem.parameters,
            templates: problem.templates,
            supportedLanguages: problem.supportedLanguages
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

    async findByProblemNumber(problemNumber: number): Promise<Problem | null> {
        const problem = await ProblemModel.findOne({ problemNumber });
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
                // .sort(filters.name ? { score: { $meta: "textScore" } } : { createdAt: -1 })  // Sort by relevance if searching
                .skip(skip)
                .limit(limit),
            ProblemModel.countDocuments(query)
        ]);

        return {
            problems: problems.map((p: any) => this.mapToDomain(p)),
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
        return new Problem({
            problemNumber: doc.problemNumber,
            title: doc.title,
            slug: doc.slug,
            difficulty: doc.difficulty,
            tags: doc.tags,
            description: doc.description,
            constraints: doc.constraints,
            examples: doc.examples,
            likes: doc.likes,
            totalSubmissions: doc.totalSubmissions,
            acceptedSubmissions: doc.acceptedSubmissions,
            hints: doc.hints,
            companies: doc.companies,
            isActive: doc.isActive,
            createdBy: doc.createdBy,
            functionName: doc.functionName,
            returnType: doc.returnType,
            parameters: doc.parameters,
            supportedLanguages: doc.supportedLanguages,
            templates: doc.templates,
            id: doc._id.toString(),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    async getFilteredProblems(
        filters: ProblemFilters,
        pagination: PaginationOptions
    ): Promise<{
        problems: Problem[];
        total: number;
    }> {
        try {
            console.log("query filters:", filters);

            const query: any = {};

            // Handle search filter
            if (filters.search) {
                const searchNum = Number(filters.search);
                query.$or = [
                    { title: { $regex: filters.search, $options: 'i' } },
                    ...(isNaN(searchNum) ? [] : [{ problemNumber: searchNum }])
                ];
            }

            // Handle difficulty filter
            if (filters.difficulty) {
                query.difficulty = filters.difficulty.toLowerCase();
            }

            // Handle tags filter
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }

            // Handle language filter
            if (filters.languageId) {
                query.supportedLanguages = { $in: [filters.languageId] };
            }

            // Handle status filter
            if (filters.status) {
                if (filters.status === "Published") {
                    query.isActive = true;
                } else if (filters.status === "Draft") {
                    query.isActive = false;
                }
            }

            query.isActive = true;

            const skip = (pagination.page - 1) * pagination.limit;

            const [problems, total] = await Promise.all([
                ProblemModel.find(query)
                    .skip(skip)
                    .limit(pagination.limit)
                    .lean(),
                ProblemModel.countDocuments(query)
            ]);

            // Transform MongoDB documents to domain entities
            const transformedProblems = problems.map((doc: any) => {
                return new Problem({
                    id: doc._id?.toString(),
                    problemNumber: doc.problemNumber,
                    title: doc.title,
                    slug: doc.slug,
                    difficulty: doc.difficulty,
                    tags: doc.tags || [],
                    description: doc.description,
                    constraints: doc.constraints || [],
                    examples: doc.examples || [],
                    likes: doc.likes || [],
                    totalSubmissions: doc.totalSubmissions || 0,
                    acceptedSubmissions: doc.acceptedSubmissions || 0,
                    hints: doc.hints || [],
                    companies: doc.companies || [],
                    isActive: doc.isActive !== undefined ? doc.isActive : true,
                    createdBy: doc.createdBy,
                    functionName: doc.functionName,
                    returnType: doc.returnType,
                    parameters: doc.parameters || [],
                    supportedLanguages: doc.supportedLanguages || [],
                    templates: doc.templates || {},
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt
                });
            });

            return {
                problems: transformedProblems,
                total
            };

        } catch (error) {
            console.error('Repository error in getFilteredProblems:', error);
            throw new Error(`Failed to fetch filtered problems: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }




    async getProblemNames(params: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<{
        problems: Array<{
            id: string
            problemNumber: number;
            title: string;
            difficulty: 'easy' | 'medium' | 'hard';
        }>;
        totalCount: number;
    }> {
        const { page, limit, search } = params;
        const skip = (page - 1) * limit;

        // Build search query
        let query: any = { isActive: true };

        if (search && search.trim()) {
            // Search by problem number (exact match) or title (regex)
            const searchTerm = search.trim();
            const isNumericSearch = /^\d+$/.test(searchTerm);

            if (isNumericSearch) {
                query.$or = [
                    { problemNumber: parseInt(searchTerm) },
                    { title: { $regex: searchTerm, $options: 'i' } }
                ];
            } else {
                query.title = { $regex: searchTerm, $options: 'i' };
            }
        }
        const pipeline = [
            { $match: query },
            {
                $project: {
                    id: { $toString: "$_id" },
                    problemNumber: 1,
                    title: 1,
                    difficulty: 1
                }
            },
            { $sort: { problemNumber: 1 } },
            {
                $facet: {
                    problems: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await ProblemModel.aggregate(pipeline);
        const problems = result[0]?.problems || [];
        const totalCount = result[0]?.totalCount[0]?.count || 0;

        return {
            problems,
            totalCount
        };
    }

}

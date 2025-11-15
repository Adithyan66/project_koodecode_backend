import mongoose, { SortOrder } from 'mongoose';
import { Problem } from '../../domain/entities/Problem';
import ProblemModel from './models/ProblemModel';
import { IProblemRepository, PaginatedProblems, PaginationOptions, ProblemFilters, ProblemSearchFilters } from '../../domain/interfaces/repositories/IProblemRepository';
import { SubmissionModel } from './models/SubmissionModel';



export class MongoProblemRepository implements IProblemRepository {


    async create(problem: Problem): Promise<Problem> {


        const problemDoc = new ProblemModel({
            problemNumber: problem.problemNumber,
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            type: problem.type,
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
            isDeleted: problem.isDeleted,
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
        const problem = await ProblemModel.findOne({ _id: id, isDeleted: false }).populate('createdBy');
        return problem ? this.mapToDomain(problem) : null;
    }

    async findBySlug(slug: string): Promise<Problem | null> {
        const problem = await ProblemModel.findOne({ slug, isDeleted: false });
        return problem ? this.mapToDomain(problem) : null;
    }

    async findByProblemNumber(problemNumber: number): Promise<Problem | null> {
        const problem = await ProblemModel.findOne({ problemNumber, isDeleted: false });
        return problem ? this.mapToDomain(problem) : null;
    }

    async findAll(filters: {
        difficulty?: 'easy' | 'medium' | 'hard';
        type?: 'array' | 'pattern' | 'dsa';
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

        const query: any = { isDeleted: false };

        if (filters.difficulty) {
            query.difficulty = filters.difficulty;
        }

        if (filters.type) {
            query.type = filters.type;
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
            type: doc.type,
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
            isDeleted: doc.isDeleted,
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

            const query: any = { isDeleted: false };

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

            if (filters.type) {
                query.type = filters.type;
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
                    type: doc.type,
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
        const query: any = { isActive: true };

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
                    difficulty: 1,
                    type: 1
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

    async findAllForAdminWithFilters(filters: ProblemSearchFilters): Promise<PaginatedProblems> {
    try {
      const { search, difficulty, status, page, limit, sortBy, sortOrder } = filters;
      
      // Build MongoDB query
      const query: any = { isDeleted: false };
      
      // Search by problem number or title
      if (search) {
        const searchNumber = parseInt(search);
        if (!isNaN(searchNumber)) {
          // If search is a number, search by problem number
          query.problemNumber = searchNumber;
        } else {
          // If search is text, search by title (case-insensitive)
          query.title = { $regex: search, $options: 'i' };
        }
      }
      
      // Filter by difficulty
      if (difficulty) {
        query.difficulty = difficulty;
      }

      if (filters.type) {
        query.type = filters.type;
      }
      
      // Filter by status (active/inactive)
      if (status) {
        query.isActive = status === 'active';
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Build sort object
      const sort: any = {};
      if (sortBy === 'acceptanceRate' || sortBy === 'totalSubmissions') {
        // These fields need to be calculated, so we'll sort in application layer
        sort.problemNumber = sortOrder === 'desc' ? -1 : 1;
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }
      
      // Execute queries in parallel
      const [problems, totalCount] = await Promise.all([
        ProblemModel
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        ProblemModel.countDocuments(query)
      ]);
      
      // Convert to domain entities
      const domainProblems = problems.map(p => new Problem({
        problemNumber: p.problemNumber,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        type: p.type,
        tags: p.tags,
        description: p.description,
        constraints: p.constraints,
        examples: p.examples,
        likes: p.likes || [],
        totalSubmissions: p.totalSubmissions || 0,
        acceptedSubmissions: p.acceptedSubmissions || 0,
        hints: p.hints || [],
        companies: p.companies || [],
        isActive: p.isActive,
        createdBy: p.createdBy,
        functionName: p.functionName,
        returnType: p.returnType,
        parameters: p.parameters,
        supportedLanguages: p.supportedLanguages,
        templates: p.templates,
        id: p._id?.toString(),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      
      return {
        problems: domainProblems,
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPreviousPage
      };
    } catch (error) {
      throw error;
    }
  }

  async getSubmissionStatsByProblemId(problemId: string): Promise<{
    totalSubmissions: number;
    acceptedSubmissions: number;
  }> {
    try {
      
      const stats = await SubmissionModel.aggregate([
        { 
          $match: { 
            problemId: new mongoose.Types.ObjectId(problemId) 
          } 
        },
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            acceptedSubmissions: {
              $sum: {
                $cond: [{ $eq: ["$status", "accepted"] }, 1, 0]
              }
            }
          }
        }
      ]);
      console.log("stats",stats);
      

      return stats[0] || { totalSubmissions: 0, acceptedSubmissions: 0 };
    } catch (error) {
      throw error;
    }
  }

  async getOverallStats(): Promise<{
    totalProblems: number;
    activeCount: number;
    inactiveCount: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  }> {
    try {
      const stats = await ProblemModel.aggregate([
        {
          $group: {
            _id: null,
            totalProblems: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
            },
            inactiveCount: {
              $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
            },
            easyCount: {
              $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] }
            },
            mediumCount: {
              $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] }
            },
            hardCount: {
              $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalProblems: 0,
        activeCount: 0,
        inactiveCount: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0
      };
    } catch (error) {
      throw error;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await ProblemModel.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedAt: new Date() },
      { new: true }
    );
    return !!result;
  }

  async softDeleteBySlug(slug: string): Promise<boolean> {
    const result = await ProblemModel.findOneAndUpdate(
      { slug },
      { isDeleted: true, updatedAt: new Date() },
      { new: true }
    );
    return !!result;
  }

}

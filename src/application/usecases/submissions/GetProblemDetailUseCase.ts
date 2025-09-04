export class GetProblemDetailUseCase {
    constructor(
        private problemRepository: IProblemRepository
    ) {}

    async execute(problemId: string): Promise<ProblemDetailDto> {
        const problem = await this.problemRepository.findById(problemId);
        if (!problem) {
            throw new Error('Problem not found');
        }

        const acceptanceRate = problem.totalSubmissions > 0 
            ? (problem.acceptedSubmissions / problem.totalSubmissions) * 100 
            : 0;

        return {
            id: problem._id.toString(),
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            tags: problem.tags,
            description: problem.description,
            constraints: problem.constraints,
            examples: problem.examples,
            starterCode: problem.starterCode || {},
            functionName: problem.functionName || '',
            parameters: problem.parameters || [],
            sampleTestCases: problem.testCases
                .filter(tc => tc.isSample)
                .map(tc => ({
                    id: tc._id.toString(),
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    explanation: tc.explanation
                })),
            hints: problem.hints,
            companies: problem.companies,
            stats: {
                totalSubmissions: problem.totalSubmissions,
                acceptedSubmissions: problem.acceptedSubmissions,
                acceptanceRate: Math.round(acceptanceRate * 100) / 100
            },
            relatedTopics: problem.relatedTopics || []
        };
    }
}

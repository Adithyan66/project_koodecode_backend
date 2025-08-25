

export class Problem {
    constructor(
        public title: string,
        public slug: string,
        public difficulty: 'easy' | 'medium' | 'hard',
        public tags: string[],
        public description: string,
        public constraints: string[],
        public examples: any,
        public testCases: {
            input: any;
            expectedOutput: any;
            isSample: boolean;
            explanation?: string;
            createdAt: Date;
        }[],
        public likes: string[] = [], 
        public totalSubmissions: number = 0,
        public acceptedSubmissions: number = 0,
        public hints: string[] = [],
        public companies: string[] = [],
        public isActive: boolean = true,
        public createdBy: string, 
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
    ) {}

    get acceptanceRate(): number {
        return this.totalSubmissions > 0 
            ? Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100) 
            : 0;
    }

    addTestCase(testCase: {
        input: any;
        expectedOutput: any;
        isSample: boolean;
        explanation?: string;
    }): void {
        if (this.testCases.length >= 50) {
            throw new Error('Maximum 50 test cases allowed per problem');
        }
        this.testCases.push({
            ...testCase,
            createdAt: new Date()
        });
    }

    toggleActive(): void {
        this.isActive = !this.isActive;
    }

    addLike(userId: string): void {
        if (!this.likes.includes(userId)) {
            this.likes.push(userId);
        }
    }

    removeLike(userId: string): void {
        this.likes = this.likes.filter(id => id !== userId);
    }
}

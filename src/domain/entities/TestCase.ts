

export class TestCase {
    constructor(
        public problemId: string,
        public inputs: any,
        public expectedOutput: any,
        public isSample: boolean,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
    ) {}

    static createTestCase(
        problemId: string,
        inputs: any,
        expectedOutput: any,
        isSample: boolean,
        explanation?: string
    ): TestCase {
        return new TestCase(
            problemId,
            inputs,
            expectedOutput,
            isSample,
            undefined,
            new Date(),
            new Date()
        );
    }

    updateTestCase(input?: any, expectedOutput?: any, explanation?: string): void {
        if (input !== undefined) this.inputs = input;
        if (expectedOutput !== undefined) this.expectedOutput = expectedOutput;
        this.updatedAt = new Date();
    }
}

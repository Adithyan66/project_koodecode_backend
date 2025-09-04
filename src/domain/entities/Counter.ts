

export class Counter {
    constructor(
        public id: string,
        public sequenceValue: number,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    increment(): number {
        this.sequenceValue += 1;
        this.updatedAt = new Date();
        return this.sequenceValue;
    }

    static create(id: string, initialValue: number = 0): Counter {
        return new Counter(
            id,
            initialValue,
            new Date(),
            new Date()
        );
    }
}

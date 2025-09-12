

export interface ICounterRepository {
    getNextSequenceValue(counterId: string): Promise<number>;
    initializeCounter(counterId: string, initialValue?: number): Promise<void>;
    getCurrentValue(counterId: string): Promise<number>;
}

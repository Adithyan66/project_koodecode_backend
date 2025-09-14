

import { ICounterRepository } from '../../domain/interfaces/repositories/ICounterRepository';
import { CounterModel } from './models/CounterModel';

export class MongoCounterRepository implements ICounterRepository {
    
    async getNextSequenceValue(counterId: string): Promise<number> {
        const result = await CounterModel.findOneAndUpdate(
            { _id: counterId },
            { $inc: { sequence_value: 1 } },
            { 
                returnDocument: 'after',
                upsert: true,
                new: true 
            }
        );
        
        return result?.sequence_value || 1;
    }

    async initializeCounter(counterId: string, initialValue: number = 0): Promise<void> {
        await CounterModel.findOneAndUpdate(
            { _id: counterId },
            { 
                $setOnInsert: { 
                    _id: counterId,
                    sequence_value: initialValue 
                }
            },
            { 
                upsert: true,
                setDefaultsOnInsert: true
            }
        );
    }

    async getCurrentValue(counterId: string): Promise<number> {
        const counter = await CounterModel.findById(counterId);
        return counter?.sequence_value || 0;
    }
}

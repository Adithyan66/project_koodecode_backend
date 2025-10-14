

import { Server as HttpServer } from 'http';

export interface IRealtimeService {
    initialize(server: HttpServer): void;
}
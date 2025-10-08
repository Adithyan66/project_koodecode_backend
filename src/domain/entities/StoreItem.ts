

export class StoreItem {
    public id?: string;
    public name: string;
    public type: StoreItemType;
    public price: number;
    public description: string;
    public isActive: boolean;
    public componentId: string; // React component identifier
    public metadata?: Record<string, any>;
    public createdAt: Date;
    public updatedAt: Date;

    constructor({
        id,
        name,
        type,
        price,
        description,
        isActive = true,
        componentId,
        metadata,
        createdAt = new Date(),
        updatedAt = new Date()
    }: {
        id?: string;
        name: string;
        type: StoreItemType;
        price: number;
        description: string;
        isActive?: boolean;
        componentId: string;
        metadata?: Record<string, any>;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.price = price;
        this.description = description;
        this.isActive = isActive;
        this.componentId = componentId;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public isConsumable(): boolean {
        return this.type === StoreItemType.TIME_TRAVEL_TICKET || 
               this.type === StoreItemType.PROBLEM_SUBMIT_TICKET;
    }

    public isPermanent(): boolean {
        return this.type === StoreItemType.PROFILE_FRAME;
    }
}

export enum StoreItemType {
    PROFILE_FRAME = "profile_frame",
    TIME_TRAVEL_TICKET = "time_travel_ticket",
    PROBLEM_SUBMIT_TICKET = "problem_submit_ticket"
}

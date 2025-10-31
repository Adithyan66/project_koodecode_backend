

export class StoreItem {
    public id?: string;
    public name: string;
    public type: StoreItemType;
    public price: number;
    public description: string;
    public imageUrl: string;
    public isActive: boolean;
    public componentId: string;
    public metadata?: Record<string, any>;
    public createdAt: Date;
    public updatedAt: Date;

    constructor({
        id,
        name,
        type,
        price,
        description,
        imageUrl,
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
        imageUrl: string;
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
        this.imageUrl = imageUrl;
        this.isActive = isActive;
        this.componentId = componentId;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public isConsumable(): boolean {
        return this.type === StoreItemType.TIME_TRAVEL_TICKET;
    }

    public isPermanent(): boolean {
        return false;
    }
}

export enum StoreItemType {
    TIME_TRAVEL_TICKET = "time_travel_ticket"
}

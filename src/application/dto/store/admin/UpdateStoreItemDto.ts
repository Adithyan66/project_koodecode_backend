export class UpdateStoreItemDto {
    price?: number;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
    metadata?: Record<string, any>;

    constructor(data: {
        price?: number;
        description?: string;
        imageUrl?: string;
        isActive?: boolean;
        metadata?: Record<string, any>;
    }) {
        this.price = data.price;
        this.description = data.description;
        this.imageUrl = data.imageUrl;
        this.isActive = data.isActive;
        this.metadata = data.metadata;
    }

    validate(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (this.price !== undefined && this.price < 0) {
            errors.push('Price must be greater than or equal to 0');
        }

        if (this.description !== undefined && this.description.trim().length === 0) {
            errors.push('Description cannot be empty');
        }

        if (this.imageUrl !== undefined && this.imageUrl.trim().length === 0) {
            errors.push('Image URL cannot be empty');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}


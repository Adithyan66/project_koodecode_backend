export class GetAllStoreItemsRequestDto {
    page: number;
    limit: number;

    constructor(data: {
        page?: number;
        limit?: number;
    }) {
        this.page = data.page || 1;
        this.limit = data.limit || 10;

        if (this.page < 1) {
            this.page = 1;
        }

        if (this.limit < 1) {
            this.limit = 10;
        } else if (this.limit > 100) {
            this.limit = 100;
        }
    }
}


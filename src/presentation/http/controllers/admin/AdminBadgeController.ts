import { inject, injectable } from 'tsyringe';
import { IHttpRequest } from '../../interfaces/IHttpRequest';
import { HttpResponse } from '../../helper/HttpResponse';
import { HTTP_STATUS } from '../../../../shared/constants/httpStatus';
import { MESSAGES } from '../../../../shared/constants/messages';
import { buildResponse } from '../../../../infrastructure/utils/responseBuilder';
import { BadRequestError, UnauthorizedError } from '../../../../application/errors/AppErrors';
import { IAdminListBadgesUseCase, IAdminGetBadgeDetailUseCase, IAdminUpdateBadgeUseCase, IAdminToggleBadgeStatusUseCase, IAdminListBadgeHoldersUseCase } from '../../../../application/interfaces/IBadgeUseCase';
import { BadgeCategory, BadgeRarity } from '../../../../domain/entities/Badge';
import { BadgeType } from '../../../../domain/entities/UserProfile';
import { AdminBadgeListRequestDto, AdminBadgeUpdateDto } from '../../../../application/dto/badges/admin/AdminBadgeDtos';

@injectable()
export class AdminBadgeController {
    constructor(
        @inject('IAdminListBadgesUseCase') private readonly listBadgesUseCase: IAdminListBadgesUseCase,
        @inject('IAdminGetBadgeDetailUseCase') private readonly getBadgeDetailUseCase: IAdminGetBadgeDetailUseCase,
        @inject('IAdminUpdateBadgeUseCase') private readonly updateBadgeUseCase: IAdminUpdateBadgeUseCase,
        @inject('IAdminToggleBadgeStatusUseCase') private readonly toggleBadgeStatusUseCase: IAdminToggleBadgeStatusUseCase,
        @inject('IAdminListBadgeHoldersUseCase') private readonly listBadgeHoldersUseCase: IAdminListBadgeHoldersUseCase
    ) {}

    listBadges = async (httpRequest: IHttpRequest) => {
        this.ensureAdmin(httpRequest);

        const {
            page,
            limit,
            search,
            types,
            categories,
            rarities,
            includeInactive,
            sortField,
            sortOrder
        } = httpRequest.query || {};

        const requestDto: AdminBadgeListRequestDto = {
            page: this.parseNumber(page, 1),
            limit: this.parseNumber(limit, 20),
            search: this.parseString(search),
            types: this.parseArray<BadgeType>(types),
            categories: this.parseArray<BadgeCategory>(categories),
            rarities: this.parseArray<BadgeRarity>(rarities),
            includeInactive: this.parseBoolean(includeInactive),
            sortField: this.parseSortField(sortField),
            sortOrder: this.parseSortOrder(sortOrder)
        };

        const result = await this.listBadgesUseCase.execute(requestDto);

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, MESSAGES.BADGES_RETRIEVED_SUCCESSFULLY, result));
    };

    getBadgeById = async (httpRequest: IHttpRequest) => {
        this.ensureAdmin(httpRequest);

        const badgeId = httpRequest.params?.badgeId;
        if (!badgeId) {
            throw new BadRequestError(MESSAGES.BADGE_ID_REQUIRED);
        }

        const result = await this.getBadgeDetailUseCase.execute(badgeId);

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, MESSAGES.BADGE_DETAILS_RETRIEVED, result));
    };

    updateBadge = async (httpRequest: IHttpRequest) => {
        this.ensureAdmin(httpRequest);

        const badgeId = httpRequest.params?.badgeId;
        if (!badgeId) {
            throw new BadRequestError(MESSAGES.BADGE_ID_REQUIRED);
        }

        const payload: AdminBadgeUpdateDto = httpRequest.body;
        const result = await this.updateBadgeUseCase.execute(badgeId, payload);

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, MESSAGES.BADGE_UPDATED_SUCCESSFULLY, result));
    };

    toggleBadgeStatus = async (httpRequest: IHttpRequest) => {
        this.ensureAdmin(httpRequest);

        const badgeId = httpRequest.params?.badgeId;
        if (!badgeId) {
            throw new BadRequestError(MESSAGES.BADGE_ID_REQUIRED);
        }

        const isActive = this.parseBoolean(httpRequest.body?.isActive, null);
        if (isActive === null) {
            throw new BadRequestError(MESSAGES.BADGE_STATUS_REQUIRED);
        }

        const result = await this.toggleBadgeStatusUseCase.execute(badgeId, isActive);

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, MESSAGES.BADGE_STATUS_UPDATED, result));
    };

    listBadgeHolders = async (httpRequest: IHttpRequest) => {
        this.ensureAdmin(httpRequest);

        const badgeId = httpRequest.params?.badgeId;
        if (!badgeId) {
            throw new BadRequestError(MESSAGES.BADGE_ID_REQUIRED);
        }

        const page = this.parseNumber(httpRequest.query?.page, 1);
        const limit = this.parseNumber(httpRequest.query?.limit, 20);

        const result = await this.listBadgeHoldersUseCase.execute(badgeId, page, limit);

        return new HttpResponse(HTTP_STATUS.OK, buildResponse(true, MESSAGES.BADGE_HOLDERS_RETRIEVED, result));
    };

    private ensureAdmin(httpRequest: IHttpRequest): void {
        const adminUserId = httpRequest.user?.userId;
        if (!adminUserId) {
            throw new UnauthorizedError(MESSAGES.ADMIN_ACCESS_REQUIRED);
        }
    }

    private parseNumber(value: any, defaultValue: number): number {
        if (value === undefined || value === null) return defaultValue;
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
            return defaultValue;
        }
        return parsed < 1 ? defaultValue : parsed;
    }

    private parseString(value: any): string | undefined {
        if (value === undefined || value === null) return undefined;
        return String(value);
    }

    private parseArray<T extends string>(value: any): T[] | undefined {
        if (!value) return undefined;
        if (Array.isArray(value)) {
            return value.map(item => String(item) as T);
        }
        if (typeof value === 'string') {
            return value
                .split(',')
                .map(item => item.trim())
                .filter(Boolean)
                .map(item => item as T);
        }
        return undefined;
    }

    private parseBoolean(value: any, defaultValue: boolean | null = false): boolean | null {
        if (value === undefined || value === null) return defaultValue;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
        }
        return defaultValue;
    }

    private parseSortField(value: any): 'name' | 'createdAt' | undefined {
        if (value === 'name' || value === 'createdAt') {
            return value;
        }
        return undefined;
    }

    private parseSortOrder(value: any): 'asc' | 'desc' | undefined {
        if (value === 'asc' || value === 'desc') {
            return value;
        }
        return undefined;
    }
}

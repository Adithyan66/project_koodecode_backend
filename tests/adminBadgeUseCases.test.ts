import 'reflect-metadata';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Badge, BadgeCategory, BadgeRarity } from '../src/domain/entities/Badge';
import { BadgeCriteria, BadgeType, UserProfile } from '../src/domain/entities/UserProfile';
import { User } from '../src/domain/entities/User';
import { IBadgeRepository, BadgeQueryOptions, BadgeQueryResult } from '../src/domain/interfaces/repositories/IBadgeRepository';
import { BadgeHolderQueryParams, BadgeHolderQueryResult, IUserProfileRepository } from '../src/domain/interfaces/repositories/IUserProfileRepository';
import { IUserRepository } from '../src/domain/interfaces/repositories/IUserRepository';
import { ListAdminBadgesUseCase } from '../src/application/usecases/badges/admin/ListAdminBadgesUseCase';
import { GetAdminBadgeDetailUseCase } from '../src/application/usecases/badges/admin/GetAdminBadgeDetailUseCase';
import { UpdateAdminBadgeUseCase } from '../src/application/usecases/badges/admin/UpdateAdminBadgeUseCase';
import { ToggleAdminBadgeStatusUseCase } from '../src/application/usecases/badges/admin/ToggleAdminBadgeStatusUseCase';
import { ListBadgeHoldersUseCase } from '../src/application/usecases/badges/admin/ListBadgeHoldersUseCase';
import { AdminBadgeUpdateDto } from '../src/application/dto/badges/admin/AdminBadgeDtos';
import { AppError } from '../src/application/errors/AppError';

class InMemoryBadgeRepository implements IBadgeRepository {
    public badges = new Map<string, Badge>();
    public lastQueryOptions: BadgeQueryOptions | null = null;

    constructor(initialBadges: Badge[]) {
        initialBadges.forEach(badge => {
            if (!badge.id) {
                badge.id = Math.random().toString(36).slice(2);
            }
            this.badges.set(badge.id, badge);
        });
    }

    async findPaginated(options: BadgeQueryOptions): Promise<BadgeQueryResult> {
        this.lastQueryOptions = options;
        const page = options.page ?? 1;
        const limit = options.limit ?? 20;
        const items = Array.from(this.badges.values()).slice((page - 1) * limit, page * limit);
        return {
            items,
            total: this.badges.size,
            page,
            limit
        };
    }

    async findById(id: string): Promise<Badge | null> {
        return this.badges.get(id) ?? null;
    }

    async update(id: string, updates: Partial<Badge>): Promise<Badge> {
        const existing = this.badges.get(id);
        if (!existing) {
            throw new Error('Badge not found');
        }
        const updated = Object.assign(new Badge(
            existing.name,
            existing.description,
            existing.type,
            existing.iconUrl,
            existing.criteria,
            existing.category,
            existing.rarity,
            existing.isActive,
            existing.id,
            existing.createdAt,
            existing.updatedAt
        ), updates);
        updated.updatedAt = new Date();
        this.badges.set(id, updated);
        return updated;
    }

    async setActiveStatus(id: string, isActive: boolean): Promise<Badge> {
        const badge = await this.findById(id);
        if (!badge) {
            throw new Error('Badge not found');
        }
        badge.isActive = isActive;
        badge.updatedAt = new Date();
        this.badges.set(id, badge);
        return badge;
    }

    async findAll(): Promise<Badge[]> {
        return Array.from(this.badges.values());
    }

    async findByType(type: BadgeType): Promise<Badge[]> {
        return Array.from(this.badges.values()).filter(badge => badge.type === type);
    }

    async create(badge: Badge): Promise<Badge> {
        const id = badge.id ?? Math.random().toString(36).slice(2);
        badge.id = id;
        this.badges.set(id, badge);
        return badge;
    }

    async delete(id: string): Promise<boolean> {
        return this.badges.delete(id);
    }

    async findActiveByCategory(category: BadgeCategory): Promise<Badge[]> {
        return Array.from(this.badges.values()).filter(badge => badge.category === category && badge.isActive);
    }
}

class InMemoryUserProfileRepository implements IUserProfileRepository {
    constructor(private readonly badgeHolderMap: Record<string, BadgeHolderQueryResult>) {}

    async findBadgeHolders(params: BadgeHolderQueryParams): Promise<BadgeHolderQueryResult> {
        const result = this.badgeHolderMap[params.badgeId] ?? {
            holders: [],
            total: 0,
            page: params.page,
            limit: params.limit
        };
        return {
            ...result,
            page: params.page,
            limit: params.limit
        };
    }

    async create(): Promise<UserProfile> { return Promise.reject(new Error('Not implemented')); }
    async findByUserId(): Promise<UserProfile | null> { return Promise.reject(new Error('Not implemented')); }
    async update(): Promise<UserProfile> { return Promise.reject(new Error('Not implemented')); }
    async updateStats(): Promise<void> { return Promise.reject(new Error('Not implemented')); }
    async getLeaderboard(): Promise<UserProfile[]> { return Promise.reject(new Error('Not implemented')); }
    async findByRanking(): Promise<UserProfile[]> { return Promise.reject(new Error('Not implemented')); }
    async updateActivities(): Promise<void> { return Promise.reject(new Error('Not implemented')); }
    async addBadge(): Promise<void> { return Promise.reject(new Error('Not implemented')); }
}

class InMemoryUserRepository implements IUserRepository {
    constructor(private readonly users: Record<string, { fullName: string; email: string; userName: string }>) {}

    async findByIds(ids: string[]) {
        return ids.map(id => {
            const userData = this.users[id] ?? { fullName: '', email: '', userName: '' };
            return new User({
            id,
                fullName: userData.fullName,
                email: userData.email,
                userName: userData.userName,
                role: 'user',
                isBlocked: false,
                profilePicUrl: undefined,
                profilePicKey: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
                provider: 'email',
                emailVerified: true
            });
        });
    }

    async findByEmail(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
    async findById(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
    async findByUsername(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
    async saveUser(): Promise<User> { return Promise.reject(new Error('Not implemented')); }
    async updateUser(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
    async changePassword(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
    async findByGoogleId(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
    async findByGithubId(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
    async findByEmailAndProvider(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
    async findAllUsersWithPagination(): Promise<{ users: User[]; total: number; }> { return Promise.reject(new Error('Not implemented')); }
    async findUserWithProfileAndBadges(): Promise<{ user: User; profile: any; badges: any[]; } | null> { return Promise.reject(new Error('Not implemented')); }
    async blockUser(): Promise<User | null> { return Promise.reject(new Error('Not implemented')); }
}

describe('Admin Badge Use Cases', () => {
    const baseCriteria = new BadgeCriteria('problems_solved', 10, 'Solve 10 problems');
    const sampleBadge = new Badge(
        'Problem Solver',
        'Solve 10 problems',
        BadgeType.PROBLEM_SOLVER,
        '/icon.svg',
        baseCriteria,
        BadgeCategory.PROGRESS,
        BadgeRarity.COMMON,
        true,
        'badge-1',
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-01T00:00:00Z')
    );

    it('lists badges with pagination metadata', async () => {
        const badgeRepo = new InMemoryBadgeRepository([sampleBadge]);
        const useCase = new ListAdminBadgesUseCase(badgeRepo);

        const result = await useCase.execute({ page: 1, limit: 10 });

        assert.equal(result.total, 1);
        assert.equal(result.items.length, 1);
        assert.equal(result.items[0].id, 'badge-1');
        assert.equal(badgeRepo.lastQueryOptions?.filters?.isActive, true);
    });

    it('returns badge detail with holder count', async () => {
        const badgeRepo = new InMemoryBadgeRepository([sampleBadge]);
        const profileRepo = new InMemoryUserProfileRepository({
            'badge-1': {
                holders: [{ userId: 'user-1', badgeId: 'badge-1', awardedAt: new Date() }],
                total: 5,
                page: 1,
                limit: 1
            }
        });
        const useCase = new GetAdminBadgeDetailUseCase(badgeRepo, profileRepo);

        const result = await useCase.execute('badge-1');

        assert.equal(result.holderCount, 5);
        assert.equal(result.id, 'badge-1');
    });

    it('updates badge fields and returns updated detail', async () => {
        const badgeRepo = new InMemoryBadgeRepository([sampleBadge]);
        const profileRepo = new InMemoryUserProfileRepository({ 'badge-1': { holders: [], total: 0, page: 1, limit: 1 } });
        const useCase = new UpdateAdminBadgeUseCase(badgeRepo, profileRepo);

        const payload: AdminBadgeUpdateDto = {
            name: 'Updated Name',
            isActive: false,
            criteria: new BadgeCriteria('problems_solved', 20, 'Solve 20 problems')
        };

        const result = await useCase.execute('badge-1', payload);

        assert.equal(result.name, 'Updated Name');
        assert.equal(result.isActive, false);
        assert.equal(result.criteria.threshold, 20);
    });

    it('throws when updating non-existent badge', async () => {
        const badgeRepo = new InMemoryBadgeRepository([]);
        const profileRepo = new InMemoryUserProfileRepository({});
        const useCase = new UpdateAdminBadgeUseCase(badgeRepo, profileRepo);

        await assert.rejects(() => useCase.execute('missing-id', {}), (error: unknown) => {
            assert.ok(error instanceof AppError);
            assert.equal((error as AppError).statusCode, 404);
            return true;
        });
    });

    it('toggles badge status', async () => {
        const badgeRepo = new InMemoryBadgeRepository([sampleBadge]);
        const profileRepo = new InMemoryUserProfileRepository({ 'badge-1': { holders: [], total: 0, page: 1, limit: 1 } });
        const useCase = new ToggleAdminBadgeStatusUseCase(badgeRepo, profileRepo);

        const result = await useCase.execute('badge-1', false);

        assert.equal(result.isActive, false);
    });

    it('lists badge holders with user details', async () => {
        const badgeRepo = new InMemoryBadgeRepository([sampleBadge]);
        const profileRepo = new InMemoryUserProfileRepository({
            'badge-1': {
                holders: [
                    { userId: 'user-1', badgeId: 'badge-1', awardedAt: new Date('2024-02-01T00:00:00Z') }
                ],
                total: 1,
                page: 1,
                limit: 10
            }
        });
        const userRepo = new InMemoryUserRepository({
            'user-1': { fullName: 'Jane Doe', email: 'jane@example.com', userName: 'janed' }
        });
        const useCase = new ListBadgeHoldersUseCase(profileRepo, userRepo);

        const result = await useCase.execute('badge-1', 1, 10);

        assert.equal(result.total, 1);
        assert.equal(result.items[0].fullName, 'Jane Doe');
        assert.equal(result.items[0].email, 'jane@example.com');
    });
});

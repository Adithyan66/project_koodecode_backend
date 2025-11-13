import { AdminDashboardResponseDto } from '../dto/admin/AdminDashboardResponseDto';

export interface IAdminDashboardStatsService {
  getDashboard(): Promise<AdminDashboardResponseDto>;
}


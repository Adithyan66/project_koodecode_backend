export interface AdminDashboardResponseDto {
  users: {
    total: number;
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    verificationRate: number;
    providers: Array<{ provider: string; count: number }>;
    recentSignups: Array<{
      id: string;
      fullName: string;
      userName: string;
      email: string;
      provider: string;
      emailVerified: boolean;
      createdAt: string;
      profilePicKey?: string;
    }>;
  };
  revenue: {
    currency: string;
    currentMonth: {
      month: string;
      revenue: number;
      orders: number;
      averageOrderValue: number;
    };
    previousMonth: {
      month: string;
      revenue: number;
      orders: number;
      averageOrderValue: number;
    };
    monthlyTrend: Array<{ month: string; revenue: number }>;
    statusBreakdown: Array<{ status: string; count: number; amount: number }>;
    paymentMethods: Array<{ method: string; count: number; amount: number }>;
  };
  submissions: {
    summary: {
      totalSubmissions: number;
      acceptedCount: number;
      rejectedCount: number;
      pendingCount: number;
      problemSubmissionsCount: number;
      contestSubmissionsCount: number;
    };
    statusTrend: Array<{ date: string; accepted: number; rejected: number; pending: number }>;
    languageDistribution: Array<{ language: string; count: number; percentage: number }>;
  };
  notifications: {
    subscribers: {
      total: number;
      newThisMonth: number;
      osDistribution: Array<{ os: string; count: number }>;
    };
  };
}


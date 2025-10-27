export interface UserFinancialDataDto {
  totalSpent: number;
  totalEarned: number;
  coinTransactions: Array<{
    transactionId: string;
    type: 'earn' | 'spend';
    amount: number;
    description: string;
    createdAt: string;
  }>;
  coinTransactionsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  paymentHistory: Array<{
    paymentId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  paymentHistoryPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


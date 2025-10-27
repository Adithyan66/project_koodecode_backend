import { CoinPurchase } from "../../../../domain/entities/CoinPurchase";

export class AdminCoinPurchaseListRequestDto {
  page: number;
  limit: number;
  search?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: 'upi' | 'card' | 'net_banking' | 'wallet' | 'emi';
  dateRange?: 'this_month' | 'last_month' | 'custom';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';

  constructor(data: {
    page: number;
    limit: number;
    search?: string;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    paymentMethod?: 'upi' | 'card' | 'net_banking' | 'wallet' | 'emi';
    dateRange?: 'this_month' | 'last_month' | 'custom';
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    this.page = data.page;
    this.limit = data.limit;
    this.search = data.search;
    this.status = data.status;
    this.paymentMethod = data.paymentMethod;
    this.dateRange = data.dateRange;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.sortBy = data.sortBy;
    this.sortOrder = data.sortOrder;
  }
}

export class AdminCoinPurchaseItemDto {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  coins: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  externalOrderId?: string;
  createdAt: string;
  completedAt?: string;

  constructor(data: {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    coins: number;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    externalOrderId?: string;
    createdAt: Date | string;
    completedAt?: Date | string;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.userEmail = data.userEmail;
    this.userName = data.userName;
    this.coins = data.coins;
    this.amount = data.amount;
    this.currency = data.currency;
    this.status = data.status;
    this.paymentMethod = data.paymentMethod;
    this.externalOrderId = data.externalOrderId;
    this.createdAt = typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toISOString();
    this.completedAt = data.completedAt ? (typeof data.completedAt === 'string' ? data.completedAt : data.completedAt.toISOString()) : undefined;
  }
}

export class AdminCoinPurchaseStatsDto {
  totalPurchasesThisMonth: number;
  totalRevenueThisMonth: number;
  pendingPurchases: number;
  failedPurchases: number;
  currency: string;

  constructor(data: {
    totalPurchasesThisMonth: number;
    totalRevenueThisMonth: number;
    pendingPurchases: number;
    failedPurchases: number;
    currency: string;
  }) {
    this.totalPurchasesThisMonth = data.totalPurchasesThisMonth;
    this.totalRevenueThisMonth = data.totalRevenueThisMonth;
    this.pendingPurchases = data.pendingPurchases;
    this.failedPurchases = data.failedPurchases;
    this.currency = data.currency;
  }
}

export class AdminCoinPurchaseListResponseDto {
  purchases: AdminCoinPurchaseItemDto[];
  stats: AdminCoinPurchaseStatsDto;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(data: {
    purchases: AdminCoinPurchaseItemDto[];
    stats: AdminCoinPurchaseStatsDto;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }) {
    this.purchases = data.purchases;
    this.stats = data.stats;
    this.pagination = data.pagination;
  }
}

export class AdminCoinPurchaseDetailDto {
  purchase: {
    id: string;
    userId: string;
    coins: number;
    amount: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    externalOrderId?: string;
    externalPaymentId?: string;
    receipt?: string;
    completedAt?: string;
    failedAt?: string;
    failureReason?: string;
    paymentMethodDetails?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    razorpayOrderStatus?: string;
    webhookVerified?: boolean;
    reconciliationNotes?: string;
    reconciledAt?: string;
    refundedAt?: string;
    refundNotes?: string;
    refundedBy?: string;
    refundedByUser?: {
      id: string;
      fullName: string;
      userName: string;
      email: string;
      profilePicKey?: string;
    };
    notes?: Array<{
      text: string;
      createdAt: string;
      createdBy: string;
      createdByUserName?: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    fullName: string;
    userName: string;
    email: string;
    profilePicKey?: string;
  };
  canReconcile: boolean;
  isStale: boolean;

  constructor(data: {
    purchase: CoinPurchase;
    user: {
      id: string;
      fullName: string;
      userName: string;
      email: string;
      profilePicKey?: string;
    };
    canReconcile: boolean;
    isStale: boolean;
    notesWithUsers?: Array<{ text: string; createdAt: Date; createdBy: string; createdByUserName: string }>;
    refundedByUser?: { id: string; fullName: string; userName: string; email: string; profilePicKey?: string };
  }) {
    this.purchase = {
      id: data.purchase.id!,
      userId: data.purchase.userId,
      coins: data.purchase.coins,
      amount: data.purchase.amount,
      currency: data.purchase.currency,
      status: data.purchase.status,
      paymentMethod: data.purchase.paymentMethod,
      externalOrderId: data.purchase.externalOrderId,
      externalPaymentId: data.purchase.externalPaymentId,
      receipt: data.purchase.receipt,
      completedAt: data.purchase.completedAt ? data.purchase.completedAt.toISOString() : undefined,
      failedAt: data.purchase.failedAt ? data.purchase.failedAt.toISOString() : undefined,
      failureReason: data.purchase.failureReason,
      paymentMethodDetails: data.purchase.paymentMethodDetails,
      ipAddress: data.purchase.ipAddress,
      userAgent: data.purchase.userAgent,
      razorpayOrderStatus: data.purchase.razorpayOrderStatus,
      webhookVerified: data.purchase.webhookVerified,
      reconciliationNotes: data.purchase.reconciliationNotes,
      reconciledAt: data.purchase.reconciledAt ? data.purchase.reconciledAt.toISOString() : undefined,
      refundedAt: data.purchase.refundedAt ? data.purchase.refundedAt.toISOString() : undefined,
      refundNotes: data.purchase.refundNotes,
      refundedBy: data.purchase.refundedBy,
      refundedByUser: data.refundedByUser,
      notes: data.notesWithUsers?.map(note => ({
        text: note.text,
        createdAt: note.createdAt.toISOString(),
        createdBy: note.createdBy,
        createdByUserName: note.createdByUserName
      })),
      createdAt: data.purchase.createdAt.toISOString(),
      updatedAt: data.purchase.updatedAt.toISOString()
    };
    this.user = data.user;
    this.canReconcile = data.canReconcile;
    this.isStale = data.isStale;
  }
}

export class ReconcilePurchaseRequestDto {
  notes?: string;

  constructor(data: { notes?: string }) {
    this.notes = data.notes;
  }
}

export class ReconcilePurchaseResponseDto {
  success: boolean;
  message: string;

  constructor(data: { success: boolean; message: string }) {
    this.success = data.success;
    this.message = data.message;
  }
}

export class RefundPurchaseRequestDto {
  notes: string;

  constructor(data: { notes: string }) {
    this.notes = data.notes;
  }
}

export class RefundPurchaseResponseDto {
  success: boolean;
  message: string;

  constructor(data: { success: boolean; message: string }) {
    this.success = data.success;
    this.message = data.message;
  }
}

export class AddNoteRequestDto {
  note: string;

  constructor(data: { note: string }) {
    this.note = data.note;
  }
}

export class AddNoteResponseDto {
  success: boolean;
  message: string;

  constructor(data: { success: boolean; message: string }) {
    this.success = data.success;
    this.message = data.message;
  }
}

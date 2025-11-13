export interface PushSubscriberQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  os?: string;
}

export interface PushSubscriberDto {
  subscriptionId: string;
  userId: string;
  userName: string;
  email: string;
  profilePicUrl?: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  os: string;
  subscribedAt: Date;
}

export interface PushSubscriberResponseDto {
  items: PushSubscriberDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


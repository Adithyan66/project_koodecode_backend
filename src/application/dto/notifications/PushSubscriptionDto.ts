export interface SubscribeRequestDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export interface SubscribeResponseDto {
  success: boolean;
  message: string;
}

export interface UnsubscribeResponseDto {
  success: boolean;
  message: string;
}


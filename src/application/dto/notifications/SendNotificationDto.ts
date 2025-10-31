import { NotificationType } from '../../../shared/constants/NotificationTypes';

export interface AdminNotificationRequestDto {
  type: NotificationType;
  title: string;
  body: string;
  targetType: 'all' | 'specific' | 'contest';
  targetUserIds?: string[];
  contestId?: string;
  icon?: string;
  data?: any;
}

export interface UserNotificationRequestDto {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  data?: any;
}

export interface NotificationResponseDto {
  success: boolean;
  message: string;
  sentCount?: number;
  failedCount?: number;
}


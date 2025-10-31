export enum NotificationType {
  CONTEST_STARTING = 'CONTEST_STARTING',
  CONTEST_ENDED = 'CONTEST_ENDED',
  CONTEST_REMINDER = 'CONTEST_REMINDER',
  ADMIN_ANNOUNCEMENT = 'ADMIN_ANNOUNCEMENT',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  MENTION = 'MENTION',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

export const NotificationMessages = {
  [NotificationType.CONTEST_STARTING]: {
    title: 'Contest Starting Now!',
    icon: '🏁',
  },
  [NotificationType.CONTEST_ENDED]: {
    title: 'Contest Ended',
    icon: '🎉',
  },
  [NotificationType.CONTEST_REMINDER]: {
    title: 'Contest Reminder',
    icon: '⏰',
  },
  [NotificationType.ADMIN_ANNOUNCEMENT]: {
    title: 'Announcement',
    icon: '📢',
  },
  [NotificationType.SYSTEM_ALERT]: {
    title: 'System Alert',
    icon: '⚠️',
  },
  [NotificationType.FRIEND_REQUEST]: {
    title: 'Friend Request',
    icon: '👋',
  },
  [NotificationType.MENTION]: {
    title: 'You were mentioned',
    icon: '💬',
  },
  [NotificationType.ACHIEVEMENT]: {
    title: 'Achievement Unlocked!',
    icon: '🏆',
  },
};


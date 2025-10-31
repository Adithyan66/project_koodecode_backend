export interface PushSubscriptionProps {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt?: Date;
  expiresAt?: Date;
  id?: string;
}

export class PushSubscription {
  public userId: string;
  public endpoint: string;
  public keys: {
    p256dh: string;
    auth: string;
  };
  public userAgent?: string;
  public createdAt: Date;
  public expiresAt?: Date;
  public id?: string;

  constructor(props: PushSubscriptionProps) {
    this.userId = props.userId;
    this.endpoint = props.endpoint;
    this.keys = props.keys;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt ?? new Date();
    this.expiresAt = props.expiresAt;
    this.id = props.id;
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }
}


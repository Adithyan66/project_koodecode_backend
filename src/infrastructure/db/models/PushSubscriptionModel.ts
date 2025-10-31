import mongoose, { Schema, Document } from 'mongoose';

export interface IPushSubscriptionDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  expiresAt?: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    userAgent: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

PushSubscriptionSchema.index({ userId: 1 });
PushSubscriptionSchema.index({ endpoint: 1 });
PushSubscriptionSchema.index({ expiresAt: 1 });

export const PushSubscriptionModel = mongoose.model<IPushSubscriptionDocument>(
  'PushSubscription',
  PushSubscriptionSchema
);


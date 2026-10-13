import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PREPARING'
  | 'ORDER_READY'
  | 'ORDER_PICKED_UP'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'DELIVERY_ASSIGNED'
  | 'PROMOTION'
  | 'SYSTEM';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    relatedEntityId: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

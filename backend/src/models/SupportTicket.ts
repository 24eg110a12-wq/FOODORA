import mongoose, { Schema, Document } from 'mongoose';

export type TicketCategory =
  | 'ORDER_STATUS'
  | 'LATE_DELIVERY'
  | 'MISSING_ITEMS'
  | 'PAYMENT_ISSUE'
  | 'FOOD_QUALITY'
  | 'OTHER';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ISupportTicket extends Document {
  ticketNumber: string;
  customerId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  adminResponse?: string;
  assignedAdminId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true
    },
    adminResponse: { type: String, default: '' },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);

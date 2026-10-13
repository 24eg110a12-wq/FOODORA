import mongoose, { Schema, Document } from 'mongoose';

export type LoyaltyType = 'EARNED' | 'REDEEMED' | 'REFUND_ADJUSTMENT' | 'WELCOME_BONUS';

export interface ILoyaltyTransaction extends Document {
  customerId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  pointsChange: number; // positive or negative
  transactionType: LoyaltyType;
  description: string;
  createdAt: Date;
}

const LoyaltyTransactionSchema: Schema = new Schema<ILoyaltyTransaction>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    pointsChange: { type: Number, required: true },
    transactionType: {
      type: String,
      enum: ['EARNED', 'REDEEMED', 'REFUND_ADJUSTMENT', 'WELCOME_BONUS'],
      required: true
    },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

export const LoyaltyTransaction = mongoose.model<ILoyaltyTransaction>(
  'LoyaltyTransaction',
  LoyaltyTransactionSchema
);

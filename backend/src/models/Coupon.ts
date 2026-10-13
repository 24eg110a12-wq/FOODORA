import mongoose, { Schema, Document } from 'mongoose';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface ICoupon extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validUntil: Date;
  usageLimit: number;
  usedCount: number;
  restaurantId?: mongoose.Types.ObjectId; // null for platform-wide
  active: boolean;
}

const CouponSchema: Schema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);

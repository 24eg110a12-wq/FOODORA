import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'ONLINE_CARD' | 'CASH_ON_DELIVERY' | 'DEMO_PAYMENT';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface IOrderItemSnapshot {
  foodItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: {
    groupName: string;
    optionName: string;
    priceDelta: number;
  }[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface IPriceBreakdown {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  serviceFee: number;
  total: number;
}

export interface IOrder extends Document {
  orderNumber: string; // e.g. FD-2026-00101
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  deliveryPartnerId?: mongoose.Types.ObjectId;
  items: IOrderItemSnapshot[];
  deliveryAddress: {
    label: string;
    recipientName: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  priceBreakdown: IPriceBreakdown;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }[];
  cancellationReason?: string;
  rejectionReason?: string;
  deliveryVerificationCode: string;
  estimatedDeliveryAt: Date;
  placedAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    deliveryPartnerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    items: [
      {
        foodItemId: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        selectedOptions: [
          {
            groupName: { type: String },
            optionName: { type: String },
            priceDelta: { type: Number, default: 0 }
          }
        ],
        specialInstructions: { type: String },
        itemTotal: { type: Number, required: true }
      }
    ],
    deliveryAddress: {
      label: { type: String, default: 'Home' },
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      deliveryInstructions: { type: String, default: '' }
    },
    priceBreakdown: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      total: { type: Number, required: true }
    },
    couponCode: { type: String, default: '' },
    paymentMethod: {
      type: String,
      enum: ['ONLINE_CARD', 'CASH_ON_DELIVERY', 'DEMO_PAYMENT'],
      default: 'DEMO_PAYMENT'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'REJECTED'
      ],
      default: 'PLACED',
      index: true
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' }
      }
    ],
    cancellationReason: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    deliveryVerificationCode: { type: String, default: '1234' },
    estimatedDeliveryAt: { type: Date, required: true },
    placedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

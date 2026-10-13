import mongoose, { Schema, Document } from 'mongoose';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IRestaurant extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  cuisineTypes: string[];
  bannerUrl: string;
  logoUrl: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    state: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  openingHours: {
    open: string;
    close: string;
    days: string[];
  };
  deliverySettings: {
    minOrderAmount: number;
    baseDeliveryFee: number;
    estimatedDeliveryTimeMin: number;
    freeDeliveryThreshold?: number;
  };
  approvalStatus: ApprovalStatus;
  isOpen: boolean;
  ratingSummary: {
    averageRating: number;
    totalReviews: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema: Schema = new Schema<IRestaurant>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    cuisineTypes: [{ type: String, trim: true }],
    bannerUrl: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      state: { type: String, default: '' }
    },
    location: {
      lat: { type: Number, default: 40.7128 },
      lng: { type: Number, default: -74.0060 }
    },
    openingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '23:00' },
      days: [{ type: String, default: 'Mon-Sun' }]
    },
    deliverySettings: {
      minOrderAmount: { type: Number, default: 15 },
      baseDeliveryFee: { type: Number, default: 3.99 },
      estimatedDeliveryTimeMin: { type: Number, default: 30 },
      freeDeliveryThreshold: { type: Number, default: 50 }
    },
    approvalStatus: { 
      type: String, 
      enum: ['PENDING', 'APPROVED', 'REJECTED'], 
      default: 'APPROVED',
      index: true
    },
    isOpen: { type: Boolean, default: true },
    ratingSummary: {
      averageRating: { type: Number, default: 4.8, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

RestaurantSchema.index({ name: 'text', description: 'text', cuisineTypes: 'text' });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

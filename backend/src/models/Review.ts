import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  foodRatings?: {
    foodItemId: mongoose.Types.ObjectId;
    rating: number;
  }[];
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema<IReview>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    foodRatings: [
      {
        foodItemId: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
        rating: { type: Number, min: 1, max: 5 }
      }
    ]
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

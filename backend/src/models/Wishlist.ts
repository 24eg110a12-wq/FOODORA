import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  customerId: mongoose.Types.ObjectId;
  restaurantIds: mongoose.Types.ObjectId[];
  foodItemIds: mongoose.Types.ObjectId[];
  updatedAt: Date;
}

const WishlistSchema: Schema = new Schema<IWishlist>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    restaurantIds: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
    foodItemIds: [{ type: Schema.Types.ObjectId, ref: 'FoodItem' }]
  },
  { timestamps: true }
);

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

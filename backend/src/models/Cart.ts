import mongoose, { Schema, Document } from 'mongoose';

export interface ISelectedOption {
  groupName: string;
  optionName: string;
  priceDelta: number;
}

export interface ICartItem {
  foodItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: ISelectedOption[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface ICart extends Document {
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId | null;
  items: ICartItem[];
  subtotal: number;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    foodItemId: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedOptions: [
      {
        groupName: { type: String, required: true },
        optionName: { type: String, required: true },
        priceDelta: { type: Number, default: 0 }
      }
    ],
    specialInstructions: { type: String, default: '' },
    itemTotal: { type: Number, required: true }
  },
  { _id: true }
);

const CartSchema: Schema = new Schema<ICart>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    items: [CartItemSchema],
    subtotal: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);

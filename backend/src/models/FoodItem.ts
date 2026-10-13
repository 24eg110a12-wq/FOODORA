import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomizationOption {
  name: string;
  priceDelta: number;
}

export interface ICustomizationGroup {
  groupName: string;
  minSelect: number;
  maxSelect: number;
  options: ICustomizationOption[];
}

export interface IFoodItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  dietaryLabels: string[]; // 'Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', etc.
  customizationGroups: ICustomizationGroup[];
  preparationTimeMin: number;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomizationOptionSchema = new Schema<ICustomizationOption>(
  {
    name: { type: String, required: true },
    priceDelta: { type: Number, default: 0 }
  },
  { _id: false }
);

const CustomizationGroupSchema = new Schema<ICustomizationGroup>(
  {
    groupName: { type: String, required: true },
    minSelect: { type: Number, default: 0 },
    maxSelect: { type: Number, default: 1 },
    options: [CustomizationOptionSchema]
  },
  { _id: false }
);

const FoodItemSchema: Schema = new Schema<IFoodItem>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    dietaryLabels: [{ type: String }],
    customizationGroups: [CustomizationGroupSchema],
    preparationTimeMin: { type: Number, default: 20 },
    isAvailable: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

FoodItemSchema.index({ name: 'text', description: 'text' });

export const FoodItem = mongoose.model<IFoodItem>('FoodItem', FoodItemSchema);

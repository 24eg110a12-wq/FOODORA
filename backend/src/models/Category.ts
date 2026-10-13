import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  iconName: string;
  sortOrder: number;
  active: boolean;
}

const CategorySchema: Schema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    iconName: { type: String, default: 'Utensils' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

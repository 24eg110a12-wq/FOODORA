import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  customerId: mongoose.Types.ObjectId;
  label: string; // 'Home', 'Work', 'Other'
  recipientName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema<IAddress>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, default: 'Home' },
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, default: 'NY' },
    postalCode: { type: String, required: true },
    deliveryInstructions: { type: String, default: '' },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Address = mongoose.model<IAddress>('Address', AddressSchema);

import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'RESTAURANT' | 'DELIVERY' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone: string;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  avatarUrl?: string;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['CUSTOMER', 'RESTAURANT', 'DELIVERY', 'ADMIN'], 
      default: 'CUSTOMER',
      index: true
    },
    phone: { type: String, default: '' },
    accountStatus: { 
      type: String, 
      enum: ['ACTIVE', 'SUSPENDED', 'PENDING'], 
      default: 'ACTIVE' 
    },
    emailVerified: { type: Boolean, default: true },
    avatarUrl: { type: String, default: '' },
    loyaltyPoints: { type: Number, default: 100, min: 0 } // Give initial 100 points welcome
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

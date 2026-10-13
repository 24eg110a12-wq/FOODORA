export type UserRole = 'CUSTOMER' | 'RESTAURANT' | 'DELIVERY' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  accountStatus: string;
  loyaltyPoints: number;
  avatarUrl?: string;
}

export interface Restaurant {
  _id: string;
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
  deliverySettings: {
    minOrderAmount: number;
    baseDeliveryFee: number;
    estimatedDeliveryTimeMin: number;
    freeDeliveryThreshold?: number;
  };
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isOpen: boolean;
  ratingSummary: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface CustomizationOption {
  name: string;
  priceDelta: number;
}

export interface CustomizationGroup {
  groupName: string;
  minSelect: number;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface FoodItem {
  _id: string;
  restaurantId: string | Restaurant;
  categoryId: string | { _id: string; name: string };
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  dietaryLabels: string[];
  customizationGroups: CustomizationGroup[];
  preparationTimeMin: number;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  iconName: string;
}

export interface SelectedOption {
  groupName: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  _id?: string;
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface Cart {
  _id: string;
  restaurantId: Restaurant | string | null;
  items: CartItem[];
  subtotal: number;
}

export interface Address {
  _id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: User | string;
  restaurantId: Restaurant | string;
  deliveryPartnerId?: User | string;
  items: CartItem[];
  deliveryAddress: {
    label: string;
    recipientName: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  priceBreakdown: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    tax: number;
    serviceFee: number;
    total: number;
  };
  couponCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus:
    | 'PLACED'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY_FOR_PICKUP'
    | 'PICKED_UP'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REJECTED';
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  cancellationReason?: string;
  rejectionReason?: string;
  deliveryVerificationCode: string;
  estimatedDeliveryAt: string;
  placedAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

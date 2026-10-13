import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, SelectedOption } from '../types';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (
    foodItemId: string,
    quantity: number,
    selectedOptions?: SelectedOption[],
    specialInstructions?: string,
    clearExisting?: boolean
  ) => Promise<any>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await apiRequest('/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (e) {
      console.error('Error fetching cart:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (
    foodItemId: string,
    quantity: number,
    selectedOptions?: SelectedOption[],
    specialInstructions?: string,
    clearExisting?: boolean
  ) => {
    try {
      const res = await apiRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          foodItemId,
          quantity,
          selectedOptions,
          specialInstructions,
          clearExisting
        })
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
      return res;
    } catch (err: any) {
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await apiRequest(`/cart/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity })
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Update item failed:', err);
    }
  };

  const clearCart = async () => {
    try {
      await apiRequest('/cart', { method: 'DELETE' });
      setCart((prev) => (prev ? { ...prev, items: [], subtotal: 0, restaurantId: null } : null));
    } catch (err) {
      console.error('Clear cart failed:', err);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, addToCart, updateQuantity, clearCart, refreshCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

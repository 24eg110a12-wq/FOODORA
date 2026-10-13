import { Response } from 'express';
import { Cart } from '../models/Cart.js';
import { FoodItem } from '../models/FoodItem.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?._id;
    let cart = await Cart.findOne({ customerId }).populate('restaurantId', 'name bannerUrl deliverySettings isOpen');

    if (!cart) {
      cart = await Cart.create({
        customerId,
        restaurantId: null,
        items: [],
        subtotal: 0
      });
    }

    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?._id;
    const { foodItemId, quantity, selectedOptions, specialInstructions, clearExisting } = req.body;

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem || !foodItem.isAvailable) {
      res.status(404).json({ success: false, message: 'Dish is currently unavailable or was not found' });
      return;
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, restaurantId: null, items: [], subtotal: 0 });
    }

    // Check single-restaurant constraint
    if (cart.restaurantId && cart.restaurantId.toString() !== foodItem.restaurantId.toString()) {
      if (!clearExisting) {
        res.status(409).json({
          success: false,
          requiresClearConfirmation: true,
          message: 'Your cart already contains items from another restaurant. Clear existing cart to add this item?'
        });
        return;
      } else {
        cart.items = [];
      }
    }

    cart.restaurantId = foodItem.restaurantId;

    // Calculate item total including customizations
    const optionsTotal = (selectedOptions || []).reduce((acc: number, opt: any) => acc + (opt.priceDelta || 0), 0);
    const unitPrice = foodItem.basePrice + optionsTotal;
    const itemTotal = Number((unitPrice * (quantity || 1)).toFixed(2));

    cart.items.push({
      foodItemId: foodItem._id as any,
      name: foodItem.name,
      price: unitPrice,
      quantity: quantity || 1,
      selectedOptions: selectedOptions || [],
      specialInstructions: specialInstructions || '',
      itemTotal
    });

    cart.subtotal = Number(cart.items.reduce((acc, item) => acc + item.itemTotal, 0).toFixed(2));
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('restaurantId', 'name bannerUrl deliverySettings isOpen');
    res.json({ success: true, message: 'Item added to cart', data: populatedCart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex((i: any) => i._id.toString() === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, message: 'Cart item not found' });
      return;
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].itemTotal = Number((cart.items[itemIndex].price * quantity).toFixed(2));
    }

    if (cart.items.length === 0) {
      cart.restaurantId = null;
    }

    cart.subtotal = Number(cart.items.reduce((acc, item) => acc + item.itemTotal, 0).toFixed(2));
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('restaurantId', 'name bannerUrl deliverySettings isOpen');
    res.json({ success: true, message: 'Cart updated', data: populatedCart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?._id;
    const cart = await Cart.findOne({ customerId });
    if (cart) {
      cart.items = [];
      cart.restaurantId = null;
      cart.subtotal = 0;
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared', data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { Response } from 'express';
import mongoose from 'mongoose';
import { Order, IOrder, OrderStatus } from '../models/Order.js';
import { Restaurant } from '../models/Restaurant.js';
import { FoodItem } from '../models/FoodItem.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { Notification } from '../models/Notification.js';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper to generate human-readable collision-resistant order ID
const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FD-${year}-${(count + 1).toString().padStart(4, '0')}-${randomSuffix}`;
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = req.user;
    if (!customer) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { restaurantId, deliveryAddress, couponCode, paymentMethod, redeemLoyaltyPoints } = req.body;

    const cart = await Cart.findOne({ customerId: customer._id });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart is empty. Please add items before checkout.' });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId || cart.restaurantId);
    if (!restaurant) {
      res.status(404).json({ success: false, message: 'Restaurant not found' });
      return;
    }

    if (!restaurant.isOpen) {
      res.status(400).json({ success: false, message: `${restaurant.name} is currently closed for new orders.` });
      return;
    }

    // Server-side recalculation and verification of items & availability
    let recalculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      const foodItem = await FoodItem.findById(item.foodItemId);
      if (!foodItem || !foodItem.isAvailable) {
        res.status(400).json({
          success: false,
          message: `Item "${item.name}" is no longer available. Please update your cart.`
        });
        return;
      }

      const optionsTotal = (item.selectedOptions || []).reduce((acc: number, opt: any) => acc + (opt.priceDelta || 0), 0);
      const verifiedUnitPrice = foodItem.basePrice + optionsTotal;
      const verifiedItemTotal = Number((verifiedUnitPrice * item.quantity).toFixed(2));

      recalculatedSubtotal += verifiedItemTotal;

      validatedItems.push({
        foodItemId: foodItem._id as any,
        name: foodItem.name,
        price: verifiedUnitPrice,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        specialInstructions: item.specialInstructions,
        itemTotal: verifiedItemTotal
      });
    }

    // Check minimum order amount
    if (recalculatedSubtotal < restaurant.deliverySettings.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order for this restaurant is $${restaurant.deliverySettings.minOrderAmount.toFixed(2)}`
      });
      return;
    }

    // Coupon discount calculation
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), active: true });
      if (coupon && new Date() <= new Date(coupon.validUntil) && recalculatedSubtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (recalculatedSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, recalculatedSubtotal);
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // Loyalty points redemption ($1 for every 100 points)
    let loyaltyDiscount = 0;
    if (redeemLoyaltyPoints && customer.loyaltyPoints >= 100) {
      const redeemablePoints = Math.min(customer.loyaltyPoints, Math.floor((recalculatedSubtotal - discount) * 100));
      loyaltyDiscount = Number((redeemablePoints / 100).toFixed(2));
      
      customer.loyaltyPoints -= redeemablePoints;
      await customer.save();

      await LoyaltyTransaction.create({
        customerId: customer._id,
        pointsChange: -redeemablePoints,
        transactionType: 'REDEEMED',
        description: `Redeemed ${redeemablePoints} points on checkout`
      });
    }

    const totalDiscount = Number((discount + loyaltyDiscount).toFixed(2));

    // Calculate delivery fee, tax (5% GST) and platform fee (₹19)
    const deliveryFee = recalculatedSubtotal >= (restaurant.deliverySettings.freeDeliveryThreshold || 599)
      ? 0
      : restaurant.deliverySettings.baseDeliveryFee;
    
    const tax = Math.round((recalculatedSubtotal - totalDiscount) * 0.05); // 5% GST
    const serviceFee = 19; // ₹19 platform fee
    const finalTotal = Math.max(0, recalculatedSubtotal - totalDiscount + deliveryFee + tax + serviceFee);

    // Generate human readable unique order ID
    const orderNumber = await generateOrderNumber();

    // Verification code for delivery partner dropoff
    const deliveryVerificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const estimatedDeliveryMinutes = restaurant.deliverySettings.estimatedDeliveryTimeMin || 35;
    const estimatedDeliveryAt = new Date(Date.now() + estimatedDeliveryMinutes * 60 * 1000);

    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      restaurantId: restaurant._id,
      items: validatedItems,
      deliveryAddress,
      priceBreakdown: {
        subtotal: Number(recalculatedSubtotal.toFixed(2)),
        discount: totalDiscount,
        deliveryFee: Number(deliveryFee.toFixed(2)),
        tax,
        serviceFee,
        total: finalTotal
      },
      couponCode: couponCode || '',
      paymentMethod: paymentMethod || 'DEMO_PAYMENT',
      paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
      orderStatus: 'PLACED',
      statusHistory: [
        {
          status: 'PLACED',
          timestamp: new Date(),
          note: 'Order successfully placed by customer.'
        }
      ],
      deliveryVerificationCode,
      estimatedDeliveryAt,
      placedAt: new Date()
    });

    // Clear user cart
    cart.items = [];
    cart.restaurantId = null;
    cart.subtotal = 0;
    await cart.save();

    // Reward Loyalty Points (10% of total as points)
    const pointsEarned = Math.round(finalTotal * 10);
    customer.loyaltyPoints += pointsEarned;
    await customer.save();

    await LoyaltyTransaction.create({
      customerId: customer._id,
      orderId: order._id as any,
      pointsChange: pointsEarned,
      transactionType: 'EARNED',
      description: `Earned ${pointsEarned} loyalty points from order ${orderNumber}`
    });

    // In-app notifications
    await Notification.create({
      userId: customer._id,
      title: 'Order Placed!',
      message: `Your order ${orderNumber} at ${restaurant.name} has been placed successfully.`,
      type: 'ORDER_PLACED',
      relatedEntityId: order._id.toString()
    });

    // Notify Restaurant owner
    await Notification.create({
      userId: restaurant.ownerId,
      title: 'New Incoming Order!',
      message: `New Order ${orderNumber} ($${finalTotal}) waiting for confirmation.`,
      type: 'ORDER_PLACED',
      relatedEntityId: order._id.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      data: order
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let filter: any = {};
    if (user.role === 'CUSTOMER') {
      filter.customerId = user._id;
    } else if (user.role === 'RESTAURANT') {
      const restaurant = await Restaurant.findOne({ ownerId: user._id });
      if (!restaurant) {
        res.json({ success: true, count: 0, data: [] });
        return;
      }
      filter.restaurantId = restaurant._id;
    } else if (user.role === 'DELIVERY') {
      filter = {
        $or: [
          { deliveryPartnerId: user._id },
          { orderStatus: 'READY_FOR_PICKUP', deliveryPartnerId: { $exists: false } },
          { orderStatus: 'READY_FOR_PICKUP', deliveryPartnerId: null }
        ]
      };
    }

    const orders = await Order.find(filter)
      .populate('restaurantId', 'name bannerUrl address phone')
      .populate('customerId', 'name phone email')
      .populate('deliveryPartnerId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId')
      .populate('customerId', 'name phone email')
      .populate('deliveryPartnerId', 'name phone');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { status, note, reason, deliveryCode } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Role-based status lifecycle validations
    if (user?.role === 'CUSTOMER') {
      if (status !== 'CANCELLED') {
        res.status(403).json({ success: false, message: 'Customers can only cancel eligible orders' });
        return;
      }
      if (order.orderStatus !== 'PLACED') {
        res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled as restaurant has already started preparation'
        });
        return;
      }
      order.cancellationReason = reason || 'Cancelled by customer';
    } else if (user?.role === 'RESTAURANT') {
      const validRestaurantTransitions = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'REJECTED'];
      if (!validRestaurantTransitions.includes(status)) {
        res.status(403).json({ success: false, message: `Invalid status update for restaurant: ${status}` });
        return;
      }
      if (status === 'REJECTED') {
        order.rejectionReason = reason || 'Rejected by restaurant';
      }
    } else if (user?.role === 'DELIVERY') {
      const validDeliveryTransitions = ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
      if (!validDeliveryTransitions.includes(status)) {
        res.status(403).json({ success: false, message: `Invalid status update for delivery partner: ${status}` });
        return;
      }

      // Assign delivery partner if unassigned
      if (!order.deliveryPartnerId) {
        order.deliveryPartnerId = user._id as any;
      }

      // For completion, check verification code
      if (status === 'DELIVERED') {
        if (deliveryCode && deliveryCode !== order.deliveryVerificationCode) {
          res.status(400).json({ success: false, message: 'Invalid delivery verification code entered' });
          return;
        }
      }
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status}`
    });

    await order.save();

    // Send customer notification
    await Notification.create({
      userId: order.customerId,
      title: `Order Status: ${status}`,
      message: `Your order ${order.orderNumber} is now ${status.replace(/_/g, ' ')}.`,
      type: `ORDER_${status}` as any,
      relatedEntityId: order._id.toString()
    });

    const updated = await Order.findById(order._id)
      .populate('restaurantId')
      .populate('customerId', 'name phone email')
      .populate('deliveryPartnerId', 'name phone');

    res.json({ success: true, message: `Order status updated to ${status}`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const previousOrder = await Order.findById(req.params.id);
    if (!previousOrder) {
      res.status(404).json({ success: false, message: 'Previous order not found' });
      return;
    }

    let cart = await Cart.findOne({ customerId: req.user?._id });
    if (!cart) {
      cart = new Cart({ customerId: req.user?._id, restaurantId: previousOrder.restaurantId, items: [], subtotal: 0 });
    }

    cart.items = [];
    cart.restaurantId = previousOrder.restaurantId;

    for (const item of previousOrder.items) {
      const food = await FoodItem.findById(item.foodItemId);
      if (food && food.isAvailable) {
        cart.items.push({
          foodItemId: food._id as any,
          name: food.name,
          price: food.basePrice,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          specialInstructions: item.specialInstructions,
          itemTotal: Number((food.basePrice * item.quantity).toFixed(2))
        });
      }
    }

    cart.subtotal = Number(cart.items.reduce((acc, i) => acc + i.itemTotal, 0).toFixed(2));
    await cart.save();

    res.json({ success: true, message: 'Items added to cart from previous order', data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

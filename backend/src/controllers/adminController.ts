import { Response } from 'express';
import { User } from '../models/User.js';
import { Restaurant } from '../models/Restaurant.js';
import { FoodItem } from '../models/FoodItem.js';
import { Order } from '../models/Order.js';
import { Coupon } from '../models/Coupon.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

export const getAdminDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({ approvalStatus: 'APPROVED' });
    const pendingRestaurants = await Restaurant.countDocuments({ approvalStatus: 'PENDING' });
    const totalOrders = await Order.countDocuments();
    
    // Aggregation for gross revenue and net breakdown
    const orders = await Order.find({ orderStatus: { $ne: 'CANCELLED' } });
    const grossSales = orders.reduce((sum, o) => sum + (o.priceBreakdown?.total || 0), 0);
    const platformNetRevenue = Number((grossSales * 0.15).toFixed(2)); // 15% platform commission

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .populate('restaurantId', 'name')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    const openTickets = await SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalRestaurants,
        activeRestaurants,
        pendingRestaurants,
        totalOrders,
        grossSales: Number(grossSales.toFixed(2)),
        platformNetRevenue,
        openTickets,
        ordersByStatus,
        recentOrders
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Foodora2026!', salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'CUSTOMER',
      phone: phone || '',
      accountStatus: 'ACTIVE',
      emailVerified: true
    });

    await AuditLog.create({
      actorId: req.user?._id,
      action: 'ADMIN_CREATED_USER',
      entityType: 'USER',
      entityId: user._id.toString(),
      details: { role, email }
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.accountStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await user.save();

    await AuditLog.create({
      actorId: req.user?._id,
      action: 'ADMIN_TOGGLE_USER_STATUS',
      entityType: 'USER',
      entityId: user._id.toString(),
      details: { newStatus: user.accountStatus }
    });

    res.json({ success: true, message: `User status changed to ${user.accountStatus}`, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRestaurantApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { approvalStatus } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ success: false, message: 'Restaurant not found' });
      return;
    }

    restaurant.approvalStatus = approvalStatus;
    await restaurant.save();

    await AuditLog.create({
      actorId: req.user?._id,
      action: 'ADMIN_UPDATE_RESTAURANT_APPROVAL',
      entityType: 'RESTAURANT',
      entityId: restaurant._id.toString(),
      details: { approvalStatus }
    });

    res.json({ success: true, message: `Restaurant ${approvalStatus.toLowerCase()}`, data: restaurant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, validUntil, usageLimit } = req.body;
    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || undefined,
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: usageLimit || 500,
      active: true
    });

    await AuditLog.create({
      actorId: req.user?._id,
      action: 'ADMIN_CREATED_COUPON',
      entityType: 'COUPON',
      entityId: coupon._id.toString()
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.find().populate('actorId', 'name email role').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

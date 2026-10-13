import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon.js';

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal, restaurantId } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required' });
      return;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), active: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
      return;
    }

    if (new Date() > new Date(coupon.validUntil)) {
      res.status(400).json({ success: false, message: 'Coupon has expired' });
      return;
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'Coupon redemption limit has been reached' });
      return;
    }

    if (subtotal < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Order subtotal must be at least $${coupon.minOrderAmount.toFixed(2)} to use this coupon`
      });
      return;
    }

    if (coupon.restaurantId && restaurantId && coupon.restaurantId.toString() !== restaurantId.toString()) {
      res.status(400).json({ success: false, message: 'Coupon is not applicable for this restaurant' });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discountAmount.toFixed(2))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

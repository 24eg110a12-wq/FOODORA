import { Response } from 'express';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';
import { AuthRequest } from '../middleware/auth.js';

export const getLoyaltyInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = req.user;
    const transactions = await LoyaltyTransaction.find({ customerId: customer?._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        pointsBalance: customer?.loyaltyPoints || 0,
        dollarEquivalent: Number(((customer?.loyaltyPoints || 0) / 100).toFixed(2)),
        transactions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

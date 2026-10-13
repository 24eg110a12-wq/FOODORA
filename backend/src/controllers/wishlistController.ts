import { Response } from 'express';
import { Wishlist } from '../models/Wishlist.js';
import { AuthRequest } from '../middleware/auth.js';

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let wishlist = await Wishlist.findOne({ customerId: req.user?._id })
      .populate('restaurantIds')
      .populate({
        path: 'foodItemIds',
        populate: { path: 'restaurantId', select: 'name bannerUrl' }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        customerId: req.user?._id,
        restaurantIds: [],
        foodItemIds: []
      });
    }

    res.json({ success: true, data: wishlist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleRestaurantWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.body;
    let wishlist = await Wishlist.findOne({ customerId: req.user?._id });

    if (!wishlist) {
      wishlist = new Wishlist({ customerId: req.user?._id, restaurantIds: [], foodItemIds: [] });
    }

    const index = wishlist.restaurantIds.findIndex((id) => id.toString() === restaurantId);
    let isAdded = false;

    if (index > -1) {
      wishlist.restaurantIds.splice(index, 1);
    } else {
      wishlist.restaurantIds.push(restaurantId);
      isAdded = true;
    }

    await wishlist.save();
    res.json({ success: true, isAdded, message: isAdded ? 'Added to favorites' : 'Removed from favorites' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

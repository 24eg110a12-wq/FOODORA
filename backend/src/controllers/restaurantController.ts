import { Request, Response } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import { FoodItem } from '../models/FoodItem.js';
import { Review } from '../models/Review.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cuisine, search, sort, maxDeliveryFee, rating, isOpen } = req.query;

    const query: any = { approvalStatus: 'APPROVED' };

    if (cuisine && typeof cuisine === 'string' && cuisine !== 'All') {
      query.cuisineTypes = { $in: [new RegExp(cuisine, 'i')] };
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cuisineTypes: { $regex: search, $options: 'i' } }
      ];
    }

    if (rating) {
      query['ratingSummary.averageRating'] = { $gte: Number(rating) };
    }

    if (maxDeliveryFee) {
      query['deliverySettings.baseDeliveryFee'] = { $lte: Number(maxDeliveryFee) };
    }

    if (isOpen === 'true') {
      query.isOpen = true;
    }

    let sortObj: any = { 'ratingSummary.averageRating': -1 };
    if (sort === 'fastest') {
      sortObj = { 'deliverySettings.estimatedDeliveryTimeMin': 1 };
    } else if (sort === 'rating') {
      sortObj = { 'ratingSummary.averageRating': -1 };
    } else if (sort === 'fee_low') {
      sortObj = { 'deliverySettings.baseDeliveryFee': 1 };
    }

    const restaurants = await Restaurant.find(query).sort(sortObj);
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ success: false, message: 'Restaurant not found' });
      return;
    }

    const menuItems = await FoodItem.find({ restaurantId: restaurant._id, isAvailable: true }).populate('categoryId');
    const reviews = await Review.find({ restaurantId: restaurant._id })
      .populate('customerId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      success: true,
      data: {
        restaurant,
        menuItems,
        reviews
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const menuItems = await FoodItem.find({ restaurantId: req.params.id }).populate('categoryId');
    res.json({ success: true, count: menuItems.length, data: menuItems });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRestaurantStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.user?._id });
    if (!restaurant && req.user?.role !== 'ADMIN') {
      res.status(404).json({ success: false, message: 'Restaurant not found for this account' });
      return;
    }

    const target = restaurant || (await Restaurant.findById(req.params.id));
    if (!target) {
      res.status(404).json({ success: false, message: 'Restaurant not found' });
      return;
    }

    if (typeof req.body.isOpen === 'boolean') {
      target.isOpen = req.body.isOpen;
      await target.save();
    }

    res.json({ success: true, message: `Restaurant is now ${target.isOpen ? 'Open' : 'Closed'}`, data: target });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

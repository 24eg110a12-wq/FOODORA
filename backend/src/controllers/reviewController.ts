import { Response } from 'express';
import { Review } from '../models/Review.js';
import { Restaurant } from '../models/Restaurant.js';
import { Order } from '../models/Order.js';
import { AuthRequest } from '../middleware/auth.js';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, restaurantId, rating, comment, foodRatings } = req.body;
    const customerId = req.user?._id;

    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      res.status(400).json({ success: false, message: 'You have already reviewed this order' });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order || order.customerId.toString() !== customerId?.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized to review this order' });
      return;
    }

    const review = await Review.create({
      orderId,
      customerId,
      restaurantId,
      rating,
      comment,
      foodRatings: foodRatings || []
    });

    // Update restaurant rating summary
    const allReviews = await Review.find({ restaurantId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Restaurant.findByIdAndUpdate(restaurantId, {
      'ratingSummary.averageRating': Number(avgRating.toFixed(1)),
      'ratingSummary.totalReviews': allReviews.length
    });

    res.status(201).json({ success: true, message: 'Thank you for your review!', data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRestaurantReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .populate('customerId', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

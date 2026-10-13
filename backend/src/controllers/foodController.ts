import { Request, Response } from 'express';
import { FoodItem } from '../models/FoodItem.js';
import { Category } from '../models/Category.js';

export const getAllFoodItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, dietary, featured } = req.query;
    const query: any = { isAvailable: true };

    if (category && typeof category === 'string' && category !== 'All') {
      const catObj = await Category.findOne({ slug: category });
      if (catObj) {
        query.categoryId = catObj._id;
      }
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (dietary && typeof dietary === 'string') {
      query.dietaryLabels = { $in: [dietary] };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const items = await FoodItem.find(query).populate('restaurantId', 'name bannerUrl ratingSummary isOpen').populate('categoryId');
    res.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFoodItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await FoodItem.findById(req.params.id)
      .populate('restaurantId')
      .populate('categoryId');

    if (!item) {
      res.status(404).json({ success: false, message: 'Food item not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ active: true }).sort({ sortOrder: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

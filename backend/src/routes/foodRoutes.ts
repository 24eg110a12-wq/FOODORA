import { Router } from 'express';
import { getAllFoodItems, getFoodItemById, getAllCategories } from '../controllers/foodController.js';

const router = Router();

router.get('/categories', getAllCategories);
router.get('/', getAllFoodItems);
router.get('/:id', getFoodItemById);

export default router;

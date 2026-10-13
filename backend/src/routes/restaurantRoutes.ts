import { Router } from 'express';
import { getAllRestaurants, getRestaurantById, getRestaurantMenu, updateRestaurantStatus } from '../controllers/restaurantController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);
router.patch('/:id/status', authenticate, authorize('RESTAURANT', 'ADMIN'), updateRestaurantStatus);

export default router;

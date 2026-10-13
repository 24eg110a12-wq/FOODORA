import { Router } from 'express';
import { getWishlist, toggleRestaurantWishlist } from '../controllers/wishlistController.js';
import { getLoyaltyInfo } from '../controllers/loyaltyController.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { getTickets, createTicket, updateTicket } from '../controllers/supportController.js';
import { createReview, getRestaurantReviews } from '../controllers/reviewController.js';
import { validateCoupon } from '../controllers/couponController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public/semi-public
router.post('/coupons/validate', validateCoupon);
router.get('/reviews/restaurant/:restaurantId', getRestaurantReviews);

// Protected routes
router.use(authenticate);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleRestaurantWishlist);

// Loyalty
router.get('/loyalty', getLoyaltyInfo);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markAsRead);
router.patch('/notifications/read-all', markAllAsRead);

// Support tickets
router.get('/support/tickets', getTickets);
router.post('/support/tickets', createTicket);
router.patch('/support/tickets/:id', updateTicket);

// Reviews
router.post('/reviews', createReview);

export default router;

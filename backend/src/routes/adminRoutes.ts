import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAdminUsers,
  createAdminUser,
  toggleUserStatus,
  updateRestaurantApproval,
  getAllCoupons,
  createCoupon,
  getAuditLogs
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/restaurants/:id/approval', updateRestaurantApproval);
router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.get('/audit-logs', getAuditLogs);

export default router;

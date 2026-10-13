import { Router } from 'express';
import { getAddresses, createAddress, deleteAddress } from '../controllers/addressController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getAddresses);
router.post('/', createAddress);
router.delete('/:id', deleteAddress);

export default router;

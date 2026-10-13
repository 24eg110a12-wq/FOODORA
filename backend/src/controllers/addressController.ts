import { Response } from 'express';
import { Address } from '../models/Address.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find({ customerId: req.user?._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, count: addresses.length, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { label, recipientName, phone, street, apartment, city, state, postalCode, deliveryInstructions, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ customerId: req.user?._id }, { isDefault: false });
    }

    const count = await Address.countDocuments({ customerId: req.user?._id });
    const address = await Address.create({
      customerId: req.user?._id,
      label: label || 'Home',
      recipientName: recipientName || req.user?.name,
      phone: phone || req.user?.phone || '555-0199',
      street,
      apartment: apartment || '',
      city: city || 'New York',
      state: state || 'NY',
      postalCode: postalCode || '10001',
      deliveryInstructions: deliveryInstructions || '',
      isDefault: isDefault || count === 0
    });

    res.status(201).json({ success: true, message: 'Address saved successfully', data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, customerId: req.user?._id });
    res.json({ success: true, message: 'Address removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

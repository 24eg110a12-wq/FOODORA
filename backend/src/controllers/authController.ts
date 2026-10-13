import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, IUser } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { AuditLog } from '../models/AuditLog.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'foodora_super_secret_jwt_key_2026';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const newUser = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      passwordHash,
      phone: validated.phone || '',
      role: 'CUSTOMER',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      loyaltyPoints: 100
    });

    const token = generateToken(newUser._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Enjoy 100 bonus loyalty points.',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        loyaltyPoints: newUser.loyaltyPoints,
        accountStatus: newUser.accountStatus
      }
    });
  } catch (error: any) {
    if (error.errors) {
      res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (user.accountStatus === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
      return;
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        loyaltyPoints: user.loyaltyPoints,
        accountStatus: user.accountStatus
      }
    });
  } catch (error: any) {
    if (error.errors) {
      res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      loyaltyPoints: req.user.loyaltyPoints,
      accountStatus: req.user.accountStatus,
      avatarUrl: req.user.avatarUrl
    }
  });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await AuditLog.create({
      actorId: user._id,
      action: 'PASSWORD_CHANGED',
      entityType: 'USER',
      entityId: user._id.toString()
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

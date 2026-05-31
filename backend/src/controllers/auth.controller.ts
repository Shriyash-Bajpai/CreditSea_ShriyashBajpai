import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const user = await User.create({ name, email, password, role: 'borrower' });

    const token = generateToken({ userId: user._id.toString(), role: user.role, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ userId: user._id.toString(), role: user.role, email: user.email });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: (err as Error).message });
  }
};

export const getMe = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

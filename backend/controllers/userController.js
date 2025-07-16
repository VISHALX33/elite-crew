import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Purchase from '../models/Purchase.js';
import Booking from '../models/Booking.js';
import WalletTransaction from '../models/WalletTransaction.js';

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Generate user_uni_id
    let lastUser = await User.findOne({ user_uni_id: { $exists: true } }).sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastUser && lastUser.user_uni_id) {
      const lastNum = parseInt(lastUser.user_uni_id.replace('USR', ''));
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }
    const user_uni_id = `USR${String(nextNumber).padStart(4, '0')}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      wallet: 70000,
      user_uni_id,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  res.json(req.user);
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
      }
      if (req.file) {
        user.profileImage = `/uploads/${req.file.filename}`;
      }
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user profile
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.notificationPreferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body
    };
    await user.save();
    res.json(user.notificationPreferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download user data
export const downloadUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const purchases = await Purchase.find({ user: req.user._id }).populate('product category');
    const bookings = await Booking.find({ user: req.user._id }).populate('service');
    const walletTransactions = await WalletTransaction.find({ user: req.user._id });
    const data = {
      profile: user,
      purchases,
      bookings,
      walletTransactions
    };
    res.setHeader('Content-Disposition', 'attachment; filename="my_data.json"');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

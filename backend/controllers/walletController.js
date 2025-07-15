import WalletTransaction from '../models/WalletTransaction.js';
import User from '../models/User.js';

// Top up wallet (user)
export const topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const user = await User.findById(req.user._id);
    user.wallet += amount;
    await user.save();
    // Record transaction
    await WalletTransaction.create({
      user: user._id,
      type: 'topup',
      amount,
      balanceAfter: user.wallet,
      description: 'Wallet top-up',
    });
    res.json({ message: 'Wallet topped up', wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get my wallet transactions
export const getMyWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all wallet transactions (admin only)
export const getAllWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find().populate('user').sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 
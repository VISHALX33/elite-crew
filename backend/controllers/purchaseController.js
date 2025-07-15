import Purchase from '../models/Purchase.js';
import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

// Purchase product (with calculation and wallet deduction)
export const purchaseProduct = async (req, res) => {
  try {
    const { productId, categoryId, date, address, pincode, details } = req.body;
    const user = await User.findById(req.user._id);
    const product = await Product.findById(productId);
    const category = await ProductCategory.findById(categoryId);
    if (!product || !category) return res.status(404).json({ message: 'Product or category not found' });

    // Calculation
    const tds = product.price * 0.10; // 10% TDS
    const gst = product.price * 0.18; // 18% GST
    const totalAmount = Math.round(product.price + tds + gst);

    if (user.wallet < totalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    user.wallet -= totalAmount;
    await user.save();

    // Record wallet transaction
    await WalletTransaction.create({
      user: user._id,
      type: 'purchase',
      amount: -totalAmount,
      balanceAfter: user.wallet,
      description: `Purchased product: ${product.title}`,
    });

    // Save purchase
    const purchase = await Purchase.create({
      user: user._id,
      product: product._id,
      category: category._id,
      date,
      address,
      pincode,
      details,
      totalAmount,
    });

    res.status(201).json({
      message: 'Product purchased successfully',
      purchase,
      wallet: user.wallet,
      breakdown: {
        base: product.price,
        tds,
        gst,
        total: totalAmount
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get purchases for current user
export const getUserPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id }).populate('product').populate('category');
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all purchases (admin only)
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('user').populate('product').populate('category');
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 
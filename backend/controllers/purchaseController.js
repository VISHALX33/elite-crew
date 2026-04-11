import Purchase from '../models/Purchase.js';
import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';

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
    const purchases = await Purchase.find({ user: req.user._id })
      .populate({
        path: 'product',
        populate: { path: 'vendor', select: 'name companyName' }
      })
      .populate('category');
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all purchases (admin only)
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('user', 'name email phone')
      .populate({
        path: 'product',
        populate: { path: 'vendor', select: 'name companyName' }
      })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Book a service via wallet
export const bookService = async (req, res) => {
  try {
    const { serviceId, date, time, address, pincode, details } = req.body;
    const user = await User.findById(req.user._id);
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const tds = service.price * 0.10;
    const gst = service.price * 0.18;
    const totalAmount = Math.round(service.price + tds + gst);

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
      description: `Booked service: ${service.title}`,
    });

    // Save booking
    const booking = await Booking.create({
      user: user._id,
      service: service._id,
      date,
      time,
      address,
      pincode,
      details,
      totalAmount,
      paymentMethod: 'wallet',
    });

    res.status(201).json({
      message: 'Service booked successfully',
      booking,
      wallet: user.wallet,
      breakdown: {
        base: service.price,
        tds,
        gst,
        total: totalAmount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for products owned by current vendor
export const getVendorOrders = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).select('_id');
    const productIds = products.map(p => p._id);

    const orders = await Purchase.find({ product: { $in: productIds } })
      .populate('user', 'name phone email')
      .populate('product', 'title image uni_id')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Purchase.findById(req.params.id).populate('product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role !== 'admin' && order.product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
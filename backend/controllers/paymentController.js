// backend/controllers/paymentController.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Purchase from '../models/Purchase.js';
import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  const { amount, currency = 'INR' } = req.body;
  const options = {
    amount: amount * 100, // amount in paise
    currency,
    receipt: `rcptid_${Date.now()}`,
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId, categoryId, serviceId, date, time, address, pincode, details } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  const hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');
  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (productId && categoryId) {
      // Product purchase logic
      const product = await Product.findById(productId);
      const category = await ProductCategory.findById(categoryId);
      if (!product || !category) return res.status(404).json({ message: 'Product or category not found' });
      const tds = product.price * 0.10;
      const gst = product.price * 0.18;
      const totalAmount = Math.round(product.price + tds + gst);
      // Save purchase (no wallet deduction)
      const purchase = await Purchase.create({
        user: user._id,
        product: product._id,
        category: category._id,
        date,
        address,
        pincode,
        details,
        totalAmount,
        paymentMethod: 'razorpay',
        paymentId: razorpay_payment_id
      });
      return res.status(201).json({
        success: true,
        message: 'Product purchased successfully',
        purchase,
        breakdown: {
          base: product.price,
          tds,
          gst,
          total: totalAmount
        }
      });
    } else if (serviceId) {
      // Service booking logic
      const service = await Service.findById(serviceId);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      const tds = service.price * 0.10;
      const gst = service.price * 0.18;
      const totalAmount = Math.round(service.price + tds + gst);
      // Save booking (no wallet deduction)
      const booking = await Booking.create({
        user: user._id,
        service: service._id,
        date,
        time,
        address,
        pincode,
        details,
        totalAmount,
        paymentMethod: 'razorpay',
        paymentId: razorpay_payment_id
      });
      return res.status(201).json({
        success: true,
        message: 'Service booked successfully',
        booking,
        breakdown: {
          base: service.price,
          tds,
          gst,
          total: totalAmount
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid request: missing productId/categoryId or serviceId' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

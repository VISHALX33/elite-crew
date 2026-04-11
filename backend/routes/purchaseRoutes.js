import express from 'express';
import { 
  purchaseProduct, 
  getUserPurchases, 
  getAllPurchases, 
  bookService,
  getVendorOrders,
  updateOrderStatus,
  cancelPurchase
} from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly, vendorOnly, adminOrVendor } from '../middleware/roleMiddleware.js';
import { createRazorpayOrder, verifyRazorpayPayment, verifyWalletTopUp } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/buy', protect, purchaseProduct);
router.post('/book', protect, bookService);
router.get('/my-purchases', protect, getUserPurchases);
router.get('/vendor-orders', protect, vendorOnly, getVendorOrders);
router.patch('/orders/:id/status', protect, adminOrVendor, updateOrderStatus);
router.post('/cancel-order/:id', protect, cancelPurchase);
router.get('/all-purchases', protect, adminOnly, getAllPurchases);

// Razorpay payment endpoints
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/razorpay/verify-topup', protect, verifyWalletTopUp);

export default router;
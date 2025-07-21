import express from 'express';
import { purchaseProduct, getUserPurchases, getAllPurchases } from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/buy', protect, purchaseProduct);
router.get('/my-purchases', protect, getUserPurchases);
router.get('/all-purchases', protect, adminOnly, getAllPurchases);

// Razorpay payment endpoints
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router; 
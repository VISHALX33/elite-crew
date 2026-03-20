import express from 'express';
import { purchaseProduct, getUserPurchases, getAllPurchases, bookService } from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/buy', protect, purchaseProduct);
router.post('/book', protect, bookService);
router.get('/my-purchases', protect, getUserPurchases);
router.get('/all-purchases', protect, adminOnly, getAllPurchases);

// Razorpay payment endpoints
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

export default router;
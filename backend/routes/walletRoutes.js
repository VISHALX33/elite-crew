import express from 'express';
import { topUpWallet, getMyWalletTransactions, getAllWalletTransactions } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/topup', protect, topUpWallet);
router.get('/transactions', protect, getMyWalletTransactions);
router.get('/all-transactions', protect, adminOnly, getAllWalletTransactions);

export default router; 
import express from 'express';
import { 
  getProfile, updateProfile, deleteProfile, 
  getNotificationPreferences, updateNotificationPreferences, 
  downloadUserData, getAllVendors, approveVendor,
  firebaseAuth, login, register, getVendorById,
  verifyEmailOtp, resendOtp,
  getAddresses, addAddress, deleteAddress, setDefaultAddress
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

router.post('/register', parser.fields([
  { name: 'aadharPhoto', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 }
]), register);
router.post('/login', login);
router.post('/firebase-auth', firebaseAuth);
router.post('/verify-email', verifyEmailOtp);
router.post('/resend-otp', resendOtp);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, parser.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'aadharPhoto', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 }
]), updateProfile);
router.delete('/profile', protect, deleteProfile);
router.get('/notification-preferences', protect, getNotificationPreferences);
router.put('/notification-preferences', protect, updateNotificationPreferences);
router.get('/download-data', protect, downloadUserData);

router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.patch('/addresses/:id/default', protect, setDefaultAddress);
router.get('/vendor/:id', getVendorById);

// Admin only routes
router.get('/admin/vendors', protect, adminOnly, getAllVendors);
router.put('/admin/vendors/:id/approve', protect, adminOnly, approveVendor);

export default router;

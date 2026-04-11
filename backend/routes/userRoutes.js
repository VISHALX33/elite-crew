import express from 'express';
import { 
  getProfile, updateProfile, deleteProfile, 
  getNotificationPreferences, updateNotificationPreferences, 
  downloadUserData, getAllVendors, approveVendor,
  firebaseAuth, login, register, getVendorById
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/firebase-auth', firebaseAuth);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, parser.single('profileImage'), updateProfile);
router.delete('/profile', protect, deleteProfile);
router.get('/notification-preferences', protect, getNotificationPreferences);
router.put('/notification-preferences', protect, updateNotificationPreferences);
router.get('/download-data', protect, downloadUserData);
router.get('/vendor/:id', getVendorById);

// Admin only routes
router.get('/admin/vendors', protect, adminOnly, getAllVendors);
router.put('/admin/vendors/:id/approve', protect, adminOnly, approveVendor);

export default router;

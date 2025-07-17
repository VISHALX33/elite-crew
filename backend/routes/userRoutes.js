import express from 'express';
import { register, login, getProfile, updateProfile, deleteProfile, getNotificationPreferences, updateNotificationPreferences, downloadUserData } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, parser.single('profileImage'), updateProfile);
router.delete('/profile', protect, deleteProfile);
router.get('/notification-preferences', protect, getNotificationPreferences);
router.put('/notification-preferences', protect, updateNotificationPreferences);
router.get('/download-data', protect, downloadUserData);

export default router;

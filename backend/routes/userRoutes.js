import express from 'express';
import { register, login, getProfile, updateProfile, deleteProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.delete('/profile', protect, deleteProfile);

export default router;

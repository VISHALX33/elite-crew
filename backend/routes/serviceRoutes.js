import express from 'express';
import { createService, getServices, getServiceById, updateService, deleteService, useService, getUserBookings, getAllBookings } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Booking history routes (must come before :id)
router.get('/my-bookings', protect, getUserBookings);

// All users
router.get('/', protect, getServices);

router.post('/:id/use', protect, useService);

// Admin only
router.post('/', protect, adminOnly, upload.single('image'), createService);
router.put('/:id', protect, adminOnly, upload.single('image'), updateService);
router.delete('/:id', protect, adminOnly, deleteService);

// Get single service (all users)
router.get('/:id', protect, getServiceById);

// Get all bookings (admin only)
router.get('/admin/bookings', protect, adminOnly, getAllBookings);

export default router;

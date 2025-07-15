import express from 'express';
import { createService, getServices, getServiceById, updateService, deleteService, useService, getUserBookings, getAllBookings } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Booking history routes (must come before :id)
router.get('/my-bookings', protect, getUserBookings);
router.get('/all-bookings', protect, adminOnly, getAllBookings);

// All users
router.get('/', protect, getServices);
router.get('/:id', protect, getServiceById);
router.post('/:id/use', protect, useService);

// Admin only
router.post('/', protect, adminOnly, upload.single('image'), createService);
router.put('/:id', protect, adminOnly, upload.single('image'), updateService);
router.delete('/:id', protect, adminOnly, deleteService);

export default router;

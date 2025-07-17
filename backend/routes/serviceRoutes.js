import express from 'express';
import { createService, getServices, getServiceById, updateService, deleteService, useService, getUserBookings, getAllBookings, addServiceReview, getServiceReviews } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

// Booking history routes (must come before :id)
router.get('/my-bookings', protect, getUserBookings);

// All users
router.get('/', protect, getServices);

router.post('/:id/use', protect, useService);

// Admin only
router.post(
  '/',
  protect,
  adminOnly,
  (req, res, next) => {
    parser.single('image')(req, res, function (err) {
      if (err) {
        console.error('Multer/Cloudinary error:', err);
        return res.status(500).json({ message: err.message || 'Upload error' });
      }
      console.log('After parser:', req.file, req.body);
      next();
    });
  },
  createService
);
router.put('/:id', protect, adminOnly, parser.single('image'), updateService);
router.delete('/:id', protect, adminOnly, deleteService);

// Get single service (all users)
router.get('/:id', protect, getServiceById);

// Get all bookings (admin only)
router.get('/admin/bookings', protect, adminOnly, getAllBookings);

router.get('/:id/reviews', protect, getServiceReviews);
router.post('/:id/reviews', protect, addServiceReview);

export default router;

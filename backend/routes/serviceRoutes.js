import express from 'express';
import { 
  createService, 
  getServices, 
  getServiceById, 
  updateService, 
  deleteService, 
  useService, 
  getUserBookings, 
  getAllBookings, 
  addServiceReview, 
  getServiceReviews,
  getVendorServices,
  getVendorBookings,
  updateBookingStatus,
  cancelBooking
} from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly, vendorOnly, adminOrVendor } from '../middleware/roleMiddleware.js';
import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

router.post('/cancel-booking/:id', protect, cancelBooking);
router.get('/my-bookings', protect, getUserBookings);

// Vendor specific items
router.get('/mine', protect, vendorOnly, getVendorServices);
router.get('/vendor-bookings', protect, vendorOnly, getVendorBookings);
router.patch('/bookings/:id/status', protect, adminOrVendor, updateBookingStatus);

// All users
router.get('/', protect, getServices);

router.post('/:id/use', protect, useService);

// Admin or Vendor access
router.post(
  '/',
  protect,
  adminOrVendor,
  (req, res, next) => {
    parser.single('image')(req, res, function (err) {
      if (err) {
        console.error('Multer/Cloudinary error:', err);
        return res.status(500).json({ message: err.message || 'Upload error' });
      }
      next();
    });
  },
  createService
);
router.put('/:id', protect, adminOrVendor, parser.single('image'), updateService);
router.delete('/:id', protect, adminOrVendor, deleteService);

// Get single service (all users)
router.get('/:id', protect, getServiceById);

// Get all bookings (admin only)
router.get('/admin/bookings', protect, adminOnly, getAllBookings);

router.get('/:id/reviews', protect, getServiceReviews);
router.post('/:id/reviews', protect, addServiceReview);

export default router;

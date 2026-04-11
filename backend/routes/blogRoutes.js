import express from 'express';
import { 
  createBlog, getBlogs, getBlogById, updateBlog, 
  deleteBlog, likeBlog, commentBlog, getVendorBlogs 
} from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { vendorOnly, adminOrVendor } from '../middleware/roleMiddleware.js';
import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

// Vendor specific
router.get('/mine', protect, vendorOnly, getVendorBlogs);

// All users
router.get('/', protect, getBlogs);
router.get('/:id', protect, getBlogById);

// User interactions
router.post('/:id/like', protect, likeBlog);
router.post('/:id/comment', protect, commentBlog);

// Admin or Vendor access
router.post('/', protect, adminOrVendor, parser.single('image'), createBlog);
router.put('/:id', protect, adminOrVendor, parser.single('image'), updateBlog);
router.delete('/:id', protect, adminOrVendor, deleteBlog);

export default router;

import express from 'express';
import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, likeBlog, commentBlog } from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All users
router.get('/', protect, getBlogs);
router.get('/:id', protect, getBlogById);

// User interactions
router.post('/:id/like', protect, likeBlog);
router.post('/:id/comment', protect, commentBlog);

// Admin only
router.post('/', protect, adminOnly, upload.single('image'), createBlog);
router.put('/:id', protect, adminOnly, upload.single('image'), updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

export default router;

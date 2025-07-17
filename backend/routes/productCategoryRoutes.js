import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/productCategoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

router.get('/', protect, getCategories);
router.post('/', protect, adminOnly, parser.single('image'), createCategory);
router.put('/:id', protect, adminOnly, parser.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router; 
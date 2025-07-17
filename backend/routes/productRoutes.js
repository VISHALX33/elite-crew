import express from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, addProductReview, getProductReviews } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

router.get('/', protect, getProducts);

router.post('/', protect, adminOnly, parser.single('image'), createProduct);
router.put('/:id', protect, adminOnly, parser.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

router.get('/:id', protect, getProductById);
router.get('/:id/reviews', protect, getProductReviews);
router.post('/:id/reviews', protect, addProductReview);

export default router;

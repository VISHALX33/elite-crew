import express from 'express';
import { 
  createProduct, getProducts, getProductById, updateProduct, 
  deleteProduct, addProductReview, getProductReviews, getVendorProducts 
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { vendorOnly, adminOrVendor } from '../middleware/roleMiddleware.js';
import parser from '../middleware/cloudinaryStorage.js';

const router = express.Router();

// Vendor specific
router.get('/mine', protect, vendorOnly, getVendorProducts);

router.get('/', protect, getProducts);

router.post('/', protect, adminOrVendor, parser.single('image'), createProduct);
router.put('/:id', protect, adminOrVendor, parser.single('image'), updateProduct);
router.delete('/:id', protect, adminOrVendor, deleteProduct);

router.get('/:id', protect, getProductById);
router.get('/:id/reviews', protect, getProductReviews);
router.post('/:id/reviews', protect, addProductReview);

export default router;

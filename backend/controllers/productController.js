import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';
import User from '../models/User.js';

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    console.log('Received:', { title, description, price, category });
    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Title, price, and category are required.' });
    }
    const image = req.file ? req.file.path : '';
    // Generate next uni_id
    let last = await Product.findOne({ uni_id: { $exists: true } }).sort({ createdAt: -1 });
    let nextNumber = 1;
    if (last && last.uni_id) {
      const lastNum = parseInt(last.uni_id.replace('PRO', ''));
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }
    const uni_id = `PRO${String(nextNumber).padStart(4, '0')}`;
    const product = await Product.create({ title, description, price, image, category, uni_id });
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err); // Add this line
    res.status(500).json({ message: err.message });
  }
};

// Get all products (all users)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product (all users)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    if (req.file) product.image = req.file.path;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a review to a product
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Prevent duplicate review by same user
    if (product.reviews.some(r => r.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
      createdAt: new Date()
    };
    product.reviews.push(review);
    await product.save();
    res.status(201).json({ message: 'Review added.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name profileImage');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const reviews = product.reviews || [];
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 0;
    res.json({ reviews, averageRating: Number(avgRating), totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

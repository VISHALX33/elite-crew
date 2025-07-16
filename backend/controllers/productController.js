import Product from '../models/Product.js';
import ProductCategory from '../models/ProductCategory.js';

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
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
    if (req.file) product.image = `/uploads/${req.file.filename}`;
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

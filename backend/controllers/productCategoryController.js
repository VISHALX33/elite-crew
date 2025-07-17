import ProductCategory from '../models/ProductCategory.js';

// Create category (admin only)
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.path : '';
    const category = await ProductCategory.create({ name, image });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all categories (all users)
export const getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update category (admin only)
export const updateCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    category.name = req.body.name || category.name;
    if (req.file) category.image = req.file.path;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 
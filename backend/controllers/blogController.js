import Blog from '../models/Blog.js';
import User from '../models/User.js';

// Create blog (admin only)
export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    // Generate next uni_id
    let last = await Blog.findOne({ uni_id: { $exists: true } }).sort({ createdAt: -1 });
    let nextNumber = 1;
    if (last && last.uni_id) {
      const lastNum = parseInt(last.uni_id.replace('BLO', ''));
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }
    const uni_id = `BLO${String(nextNumber).padStart(4, '0')}`;
    const blog = await Blog.create({
      title,
      content,
      image,
      author: req.user._id,
      uni_id
    });
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all blogs (all users)
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'name email').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single blog (all users)
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email').populate('comments.user', 'name email');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update blog (admin only)
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    if (req.file) blog.image = `/uploads/${req.file.filename}`;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete blog (admin only)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like/unlike blog (all users)
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const userId = req.user._id;
    const index = blog.likes.indexOf(userId);
    if (index === -1) {
      blog.likes.push(userId);
      await blog.save();
      return res.json({ message: 'Blog liked' });
    } else {
      blog.likes.splice(index, 1);
      await blog.save();
      return res.json({ message: 'Blog unliked' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Comment on blog (all users)
export const commentBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    const comment = {
      user: req.user._id,
      text: req.body.text
    };
    blog.comments.push(comment);
    await blog.save();
    res.json({ message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

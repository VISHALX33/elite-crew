export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.email === 'admin@gmail.com')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
}; 
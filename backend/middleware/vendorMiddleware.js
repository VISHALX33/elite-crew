export const vendorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    if (req.user.isApproved) {
      next();
    } else {
      res.status(403).json({ message: 'Vendor account pending approval' });
    }
  } else {
    res.status(403).json({ message: 'Vendor access only' });
  }
};

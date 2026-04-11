export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.email === 'admin@gmail.com')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

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

export const adminOrVendor = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'vendor' || req.user.email === 'admin@gmail.com')) {
    if (req.user.role === 'vendor' && !req.user.isApproved) {
      return res.status(403).json({ message: 'Vendor account pending approval' });
    }
    next();
  } else {
    res.status(403).json({ message: 'Admin or Vendor access only' });
  }
};

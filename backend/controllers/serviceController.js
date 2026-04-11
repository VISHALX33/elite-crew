import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

// Create service (admin only)
export const createService = async (req, res) => {
  try {
    const { title, description, price, category: categoryId } = req.body;
    const image = req.file ? req.file.path : '';
    // Generate next uni_id
    let last = await Service.findOne({ uni_id: { $exists: true } }).sort({ createdAt: -1 });
    let nextNumber = 1;
    if (last && last.uni_id) {
      const lastNum = parseInt(last.uni_id.replace('SER', ''));
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }
    const uni_id = `SER${String(nextNumber).padStart(4, '0')}`;
    const service = await Service.create({
      title,
      description,
      price,
      image,
      category: categoryId,
      uni_id,
      vendor: req.user._id // Associate with creator
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all services (all users)
export const getServices = async (req, res) => {
  try {
    const query = {};
    if (req.query.vendor) query.vendor = req.query.vendor;
    const services = await Service.find(query).populate('category').populate('vendor', 'name companyName');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get services for current vendor
export const getVendorServices = async (req, res) => {
  try {
    const services = await Service.find({ vendor: req.user._id }).populate('category');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single service (all users)
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('category').populate('vendor', 'name companyName');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update service (admin only)
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Check ownership
    if (req.user.role !== 'admin' && service.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    service.title = req.body.title || service.title;
    service.description = req.body.description || service.description;
    service.price = req.body.price || service.price;
    if (req.file) service.image = `/uploads/${req.file.filename}`;
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete service (admin only)
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Check ownership
    if (req.user.role !== 'admin' && service.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Use service (book/request with calculation and wallet deduction)
export const useService = async (req, res) => {
  try {
    const { date, time, address, pincode, details } = req.body;
    const user = await User.findById(req.user._id);
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Calculation
    const tds = service.price * 0.10; // 10% TDS
    const gst = service.price * 0.18; // 18% GST
    const totalAmount = Math.round(service.price + tds + gst);

    if (user.wallet < totalAmount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    user.wallet -= totalAmount;
    await user.save();

    // Record wallet transaction
    await WalletTransaction.create({
      user: user._id,
      type: 'booking',
      amount: -totalAmount,
      balanceAfter: user.wallet,
      description: `Booked service: ${service.title}`,
    });

    // Save booking
    const booking = await Booking.create({
      user: user._id,
      service: service._id,
      date,
      time,
      address,
      pincode,
      details,
      totalAmount,
    });

    res.status(201).json({
      message: 'Service booked successfully',
      booking,
      wallet: user.wallet,
      breakdown: {
        base: service.price,
        tds,
        gst,
        total: totalAmount
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get bookings for current user
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'service',
        populate: { path: 'vendor', select: 'name companyName' }
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate({
        path: 'service',
        populate: { path: 'vendor', select: 'name companyName' }
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a review to a service
export const addServiceReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    // Prevent duplicate review by same user
    if (service.reviews.some(r => r.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You have already reviewed this service.' });
    }
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
      createdAt: new Date()
    };
    service.reviews.push(review);
    await service.save();
    res.status(201).json({ message: 'Review added.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all reviews for a service
export const getServiceReviews = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('reviews.user', 'name profileImage');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    const reviews = service.reviews || [];
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 0;
    res.json({ reviews, averageRating: Number(avgRating), totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get bookings for services owned by current vendor
export const getVendorBookings = async (req, res) => {
  try {
    const services = await Service.find({ vendor: req.user._id }).select('_id');
    const serviceIds = services.map(s => s._id);

    const bookings = await Booking.find({ service: { $in: serviceIds } })
      .populate('user', 'name phone email')
      .populate('service', 'title image uni_id')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('service');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.service.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel booking (User initiated)
export const cancelBooking = async (req, res) => {
  try {
    console.log('Attempting to cancel booking:', req.params.id);
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      console.log('Booking not found in DB:', req.params.id);
      return res.status(404).json({ message: 'Booking not found' });
    }
    console.log('Booking found! Current status:', booking.status);

    // Verify ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check status
    const status = booking.status.toLowerCase();
    if (status !== 'pending' && status !== 'booked') {
      return res.status(400).json({ message: `Cannot cancel a booking that is already ${status}` });
    }

    // 1. Refund to wallet
    const user = await User.findById(req.user._id);
    user.wallet += booking.totalAmount;
    await user.save();

    // 2. Record transaction
    await WalletTransaction.create({
      user: user._id,
      type: 'refund',
      amount: booking.totalAmount,
      balanceAfter: user.wallet,
      description: `Refund for cancelled booking: ${booking._id}`,
    });

    // 3. Update status
    booking.status = 'Cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled and amount refunded', wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

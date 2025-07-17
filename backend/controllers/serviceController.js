import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';

// Create service (admin only)
export const createService = async (req, res) => {
  console.log("createService called. req.file:", req.file, "req.body:", req.body);
  try {
    const { title, description, price } = req.body;
    const image = req.file ? req.file.path : '';
    // Generate next uni_id
    let last = await Service.findOne({ uni_id: { $exists: true } }).sort({ createdAt: -1 });
    let nextNumber = 1;
    if (last && last.uni_id) {
      const lastNum = parseInt(last.uni_id.replace('SER', ''));
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }
    const uni_id = `SER${String(nextNumber).padStart(4, '0')}`;
    const service = await Service.create({ title, description, price, image, uni_id });
    res.status(201).json(service);
  } catch (err) {
    console.error("Service creation error:", err, "req.file:", req.file, "req.body:", req.body);
    res.status(500).json({ message: err.message });
  }
};

// Get all services (all users)
export const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single service (all users)
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
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
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
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
    const bookings = await Booking.find({ user: req.user._id }).populate('service');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('service');
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

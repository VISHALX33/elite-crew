import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Purchase from '../models/Purchase.js';
import Booking from '../models/Booking.js';
import WalletTransaction from '../models/WalletTransaction.js';
import admin from '../config/firebaseAdmin.js';
import { Resend } from 'resend';



// Firebase Authentication (Verify Token and Login/Register)
export const firebaseAuth = async (req, res) => {
  const { idToken, userData } = req.body;

  try {
    if (!admin.apps.length) {
      console.error('Firebase Admin not initialized!');
      return res.status(500).json({ message: 'Firebase Admin not initialized on server.' });
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { phone_number, email, name, picture, uid } = decodedToken;

    if (!phone_number && !email) {
      return res.status(400).json({ message: 'No phone number or email associated with this token' });
    }

    let user;
    if (phone_number) {
      user = await User.findOne({ phone: phone_number });
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      // First time registration
      let lastUser = await User.findOne({ user_uni_id: { $exists: true } }).sort({ createdAt: -1 });
      let nextNumber = 1;
      if (lastUser && lastUser.user_uni_id) {
        const lastNum = parseInt(lastUser.user_uni_id.replace('USR', ''));
        if (!isNaN(lastNum)) nextNumber = lastNum + 1;
      }
      const user_uni_id = `USR${String(nextNumber).padStart(4, '0')}`;

      user = await User.create({
        phone: phone_number || undefined,
        email: email || undefined,
        name: userData?.name || name || 'New User',
        profileImage: picture || '',
        role: userData?.role || 'user',
        companyName: userData?.companyName || '',
        businessAddress: userData?.businessAddress || '',
        user_uni_id,
        wallet: 0,
        isApproved: userData?.role === 'admin'
      });
    } else {
      // Update existing user info if provided or if it's missing
      let updated = false;
      if (userData?.name && user.name !== userData.name) {
        user.name = userData.name;
        updated = true;
      } else if (name && !user.name) {
        user.name = name;
        updated = true;
      }

      if (picture && !user.profileImage) {
        user.profileImage = picture;
        updated = true;
      }

      if (userData?.companyName) {
        user.companyName = userData.companyName;
        updated = true;
      }
      if (userData?.businessAddress) {
        user.businessAddress = userData.businessAddress;
        updated = true;
      }

      if (updated) await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user, message: 'Authentication successful' });
  } catch (err) {
    console.error('Firebase Auth Full Error:', err);
    if (err.message.includes('token') || err.message.includes('auth')) {
      res.status(401).json({
        message: 'Authentication failed. Invalid Firebase token.',
        error: err.message
      });
    } else {
      res.status(500).json({
        message: 'Server error during authentication.',
        error: err.message
      });
    }
  }
};

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role: requestedRole, companyName, businessAddress, phone } = req.body;
    let userExists = await User.findOne({ email });

    if (userExists && userExists.isEmailVerified) {
      return res.status(400).json({ message: 'User already exists and is verified. Please log in.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (userExists) {
      if (password) userExists.password = await bcrypt.hash(password, 10);
      userExists.otp = otp;
      userExists.otpExpires = otpExpires;
      userExists.name = name;
      userExists.phone = phone || userExists.phone;
      if (requestedRole === 'vendor') {
        userExists.companyName = companyName;
        userExists.businessAddress = businessAddress;
      }
      if (req.files) {
        if (req.files.aadharPhoto) userExists.aadharPhoto = req.files.aadharPhoto[0].path;
        if (req.files.gstCertificate) userExists.gstCertificate = req.files.gstCertificate[0].path;
      }
      await userExists.save();
    } else {
      let lastUser = await User.findOne({ user_uni_id: { $exists: true } }).sort({ createdAt: -1 });
      let nextNumber = 1;
      if (lastUser && lastUser.user_uni_id) {
        const lastNum = parseInt(lastUser.user_uni_id.replace('USR', ''));
        if (!isNaN(lastNum)) nextNumber = lastNum + 1;
      }
      const user_uni_id = `USR${String(nextNumber).padStart(4, '0')}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      let role = requestedRole || 'user';
      if (email === 'admin@gmail.com' || email === 'vishal@gmail.com') role = 'admin';

      let aadharPhoto = '';
      let gstCertificate = '';
      if (req.files) {
        if (req.files.aadharPhoto) aadharPhoto = req.files.aadharPhoto[0].path;
        if (req.files.gstCertificate) gstCertificate = req.files.gstCertificate[0].path;
      }

      await User.create({
        name, email, password: hashedPassword, wallet: 0, user_uni_id, role,
        phone,
        companyName: role === 'vendor' ? companyName : '',
        businessAddress: role === 'vendor' ? businessAddress : '',
        aadharPhoto,
        gstCertificate,
        isApproved: role === 'admin',
        isEmailVerified: false, otp, otpExpires
      });
    }

    try {
      await (new Resend(process.env.RESEND_API_KEY)).emails.send({
        from: 'Elite Crew <noreply@quickhaat.notesea.xyz>',
        to: email,
        subject: 'Verify your Elite Crew Account',
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Elite Crew!</h2>
          <p>Please enter the following OTP to verify your email address:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>`
      });
    } catch (err) {
      console.log('Resend email error:', err);
    }

    res.status(201).json({ message: 'OTP sent to your email. Please verify.', email, requiresVerification: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify Email OTP
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > new Date(user.otpExpires)) return res.status(400).json({ message: 'OTP has expired' });

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Email verified successfully', token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await (new Resend(process.env.RESEND_API_KEY)).emails.send({
        from: 'Elite Crew <noreply@quickhaat.notesea.xyz>',
        to: email,
        subject: 'Your new Elite Crew OTP',
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Elite Crew Verification</h2>
          <p>Your new OTP is:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>`
      });
    } catch (err) {
      console.log('Resend error:', err);
    }

    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  res.json(req.user);
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
      }
      if (req.files) {
        if (req.files.profileImage) user.profileImage = req.files.profileImage[0].path;
        if (req.files.aadharPhoto) user.aadharPhoto = req.files.aadharPhoto[0].path;
        if (req.files.gstCertificate) user.gstCertificate = req.files.gstCertificate[0].path;
      }
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user profile
export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.notificationPreferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body
    };
    await user.save();
    res.json(user.notificationPreferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download user data
export const downloadUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const purchases = await Purchase.find({ user: req.user._id }).populate('product category');
    const bookings = await Booking.find({ user: req.user._id }).populate('service');
    const walletTransactions = await WalletTransaction.find({ user: req.user._id });
    const data = {
      profile: user,
      purchases,
      bookings,
      walletTransactions
    };
    res.setHeader('Content-Disposition', 'attachment; filename="my_data.json"');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Approve/Disapprove vendor
export const approveVendor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    user.isApproved = !user.isApproved;
    await user.save();
    res.json({ message: `Vendor ${user.isApproved ? 'approved' : 'disapproved'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).select('-password');
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get all addresses
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const { street, city, state, pincode, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    
    user.addresses.push({ street, city, state, pincode, isDefault });
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.forEach(a => {
      a.isDefault = a._id.toString() === req.params.id;
    });
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

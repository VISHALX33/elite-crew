import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String }, // Optional if using purely OTP
  otp: { type: String },
  otpExpires: { type: Date },
  profileImage: { type: String, default: '' },
  wallet: { type: Number, default: 0 },
  user_uni_id: { type: String, unique: true },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: true }
  },
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  companyName: { type: String },
  businessAddress: { type: String },
  isApproved: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;

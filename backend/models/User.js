import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  wallet: { type: Number, default: 70000 },
  user_uni_id: { type: String, unique: true },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    productUpdates: { type: Boolean, default: true }
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  details: { type: String },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Booked' },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking; 
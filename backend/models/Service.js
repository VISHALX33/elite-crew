import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;

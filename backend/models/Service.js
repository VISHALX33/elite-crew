import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  price: { type: Number, required: true },
  image: { type: String },
  uni_id: { type: String, unique: true, index: true },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;

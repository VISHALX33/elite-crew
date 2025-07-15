import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  date: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  details: { type: String },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Purchased' },
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase; 
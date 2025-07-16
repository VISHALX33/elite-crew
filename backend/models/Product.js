import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  uni_id: { type: String, unique: true, index: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;

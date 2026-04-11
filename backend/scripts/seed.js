import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ProductCategory from '../models/ProductCategory.js';
import ServiceCategory from '../models/ServiceCategory.js';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Blog from '../models/Blog.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({ role: { $ne: 'admin' } }),
      ProductCategory.deleteMany({}),
      ServiceCategory.deleteMany({}),
      Product.deleteMany({}),
      Service.deleteMany({}),
      Blog.deleteMany({})
    ]);

    const password = await bcrypt.hash('password123', 10);

    // 1. Create Categories
    console.log('Creating categories...');
    const productCats = await ProductCategory.insertMany([
      { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
      { name: 'Clothing', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400' },
      { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400' },
      { name: 'Books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
      { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' }
    ]);

    const serviceCats = await ServiceCategory.insertMany([
      { name: 'Plumbing', image: 'https://images.unsplash.com/photo-1581244276891-832414916bb8?w=400' },
      { name: 'Electrical', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400' },
      { name: 'Cleaning', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?w=400' },
      { name: 'Painting', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400' },
      { name: 'Carpentry', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400' }
    ]);

    // 2. Create Vendors
    console.log('Creating vendors...');
    const vendors = [];
    for (let i = 1; i <= 5; i++) {
      const vendor = await User.create({
        name: `Vendor ${i}`,
        email: `vendor${i}@gmail.com`,
        password,
        role: 'vendor',
        companyName: `${['Tech', 'Style', 'Home', 'Elite', 'Master'][i-1]} Solutions`,
        businessAddress: `${i*123}, Business Park, City ${i}`,
        user_uni_id: `USR${String(100+i).padStart(4, '0')}`,
        isApproved: true,
        wallet: 1000
      });
      vendors.push(vendor);
    }

    // 3. Create regular users
    console.log('Creating regular users...');
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const u = await User.create({
        name: `User ${i}`,
        email: `user${i}@gmail.com`,
        password,
        role: 'user',
        user_uni_id: `USR${String(200+i).padStart(4, '0')}`,
        wallet: 5000
      });
      users.push(u);
    }

    // 4. Create Products and Services with Reviews
    console.log('Creating products and services with reviews...');
    const comments = [
      "Excellent quality, highly recommend!",
      "Good value for money.",
      "Amazing experience, will visit again.",
      "Very professional and timely.",
      "Fair price, standard quality.",
      "Exceeded my expectations!",
      "Poor communication, not happy.",
      "Satisfactory service, could be better.",
      "Quick and efficient.",
      "Best in the market!"
    ];

    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      
      // Products
      for (let j = 0; j < productCats.length; j++) {
        const productReviews = [];
        // Each product gets 2 random reviews
        const reviewCount = 2;
        const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
        for (let k = 0; k < reviewCount; k++) {
          productReviews.push({
            user: shuffledUsers[k]._id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: comments[Math.floor(Math.random() * comments.length)]
          });
        }

        await Product.create({
          title: `${productCats[j].name} Item by ${vendor.name}`,
          description: `High quality ${productCats[j].name} provided by ${vendor.companyName}.`,
          price: 500 + (i * 100) + (j * 50),
          category: productCats[j]._id,
          vendor: vendor._id,
          uni_id: `PRO${vendor.name.split(' ')[1]}${j}${i}${Date.now().toString().slice(-4)}`,
          image: productCats[j].image,
          reviews: productReviews
        });
      }

      // Services
      for (let j = 0; j < serviceCats.length; j++) {
        const serviceReviews = [];
        const reviewCount = 2;
        const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
        for (let k = 0; k < reviewCount; k++) {
          serviceReviews.push({
            user: shuffledUsers[k]._id,
            rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
            comment: comments[Math.floor(Math.random() * comments.length)]
          });
        }

        await Service.create({
          title: `${serviceCats[j].name} Service by ${vendor.name}`,
          description: `Expert ${serviceCats[j].name} assistance from ${vendor.companyName}.`,
          price: 800 + (i * 200) + (j * 100),
          category: serviceCats[j]._id,
          vendor: vendor._id,
          uni_id: `SER${vendor.name.split(' ')[1]}${j}${i}${Date.now().toString().slice(-4)}`,
          image: serviceCats[j].image,
          reviews: serviceReviews
        });
      }
      
      // ... (blogs logic remains)

      // 2 Blogs per vendor
      for (let j = 1; j <= 2; j++) {
        await Blog.create({
          title: `How to choose the best ${i%2 === 0 ? 'Product' : 'Service'} - Tip ${j}`,
          content: `In this blog, ${vendor.companyName} shares insights on selecting the right solutions for your needs...`,
          author: vendor._id,
          uni_id: `BLO${vendor.name.split(' ')[1]}${j}${i}${Date.now().toString().slice(-4)}`,
          image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400'
        });
      }
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seedData();

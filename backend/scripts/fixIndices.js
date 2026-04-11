import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env') });

const fixIndices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    console.log('Dropping index phone_1...');
    try {
      await users.dropIndex('phone_1');
      console.log('Index phone_1 dropped.');
    } catch (err) {
      console.log('Index phone_1 not found or error dropping:', err.message);
    }
    
    console.log('Recreating index phone_1 as unique and sparse...');
    await users.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('Index phone_1 recreated successfully.');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error:', err);
  }
};

fixIndices();

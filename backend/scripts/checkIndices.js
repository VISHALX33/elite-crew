import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env') });

const checkIndices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const usersCollection = collections.find(c => c.name === 'users');
    
    if (usersCollection) {
      const indices = await mongoose.connection.db.collection('users').indexes();
      console.log('Current indices for "users":');
      indices.forEach(idx => {
        console.log(`- ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${idx.unique}, sparse: ${idx.sparse})`);
      });
    } else {
      console.log('Users collection not found.');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

checkIndices();

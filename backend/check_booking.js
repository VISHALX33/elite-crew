import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Booking from './models/Booking.js';

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const id = '69da90cd4c877e90823c70ff';
    const booking = await Booking.findById(id);
    console.log('Booking found:', !!booking);
    if (booking) {
      console.log('Booking details:', JSON.stringify(booking, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const createUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const password = await bcrypt.hash('123456', 10);

        const usersData = [
            {
                name: 'Mohit',
                email: 'mohit@gmail.com',
                password,
                role: 'user',
                user_uni_id: 'USR' + Math.floor(Math.random() * 9000 + 1000),
                wallet: 5000
            },
            {
                name: 'Mohit Vendor',
                email: 'mohitvendor@gmail.com',
                password,
                role: 'vendor',
                companyName: 'Mohit Solutions',
                businessAddress: '123, Business Park, City',
                user_uni_id: 'USR' + Math.floor(Math.random() * 9000 + 1000),
                isApproved: true,
                wallet: 1000
            },
            {
                name: 'Admin',
                email: 'admin@gmail.com',
                password,
                role: 'admin',
                user_uni_id: 'USR' + Math.floor(Math.random() * 9000 + 1000)
            }
        ];

        for (const userData of usersData) {
            const exists = await User.findOne({ email: userData.email });
            if (exists) {
                console.log(`User ${userData.email} already exists. Updating password...`);
                exists.password = password;
                await exists.save();
            } else {
                console.log(`Creating user ${userData.email}...`);
                await User.create(userData);
            }
        }

        console.log('Users created/updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

createUsers();

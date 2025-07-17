import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'elite-crew',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const parser = multer({ storage: storage });

export default parser; 
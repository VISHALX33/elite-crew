// backend/config/firebaseAdmin.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// For "real life", you need to download your service account JSON from Firebase Console
// Project Settings -> Service Accounts -> Generate new private key
// Place it in the backend directory and name it 'serviceAccountKey.json'

const filenames = ['quickhaat-89c2f-firebase-adminsdk-fbsvc-7cfda8c440.json', 'serviceAccountKey.json'];
let initialized = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK Initialized from FIREBASE_SERVICE_ACCOUNT environment variable');
    initialized = true;
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err);
  }
}

if (!initialized) {
  for (const filename of filenames) {
    const serviceAccountPath = join(process.cwd(), filename);
    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log(`Firebase Admin SDK Initialized with ${filename}`);
      initialized = true;
      break;
    } catch (err) {
      // Continue to next filename if this one fails
    }
  }
}

if (!initialized) {
  console.error('Firebase Admin Initialization Failed: No valid service account file found.');
}

export default admin;

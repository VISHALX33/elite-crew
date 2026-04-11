// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWbmdizyZGi82t0ci2ylBEzY6QmoQqeX0",
  authDomain: "quickhaat-89c2f.firebaseapp.com",
  projectId: "quickhaat-89c2f",
  storageBucket: "quickhaat-89c2f.firebasestorage.app",
  messagingSenderId: "502690493387",
  appId: "1:502690493387:web:394f0106555b4643763c4e",
  measurementId: "G-CY81V78P0F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
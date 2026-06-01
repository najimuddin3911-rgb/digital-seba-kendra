import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Realtime Database-এর জন্য পরিবর্তন

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "digital-seba-kendra.firebaseapp.com",
  databaseURL: "https://digital-seba-kendra-default-rtdb.firebaseio.com", // আপনার ডাটাবেস URL
  projectId: "digital-seba-kendra",
  storageBucket: "digital-seba-kendra.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app); // Realtime Database এক্সপোর্ট করা হলো
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutUser = () => signOut(auth);

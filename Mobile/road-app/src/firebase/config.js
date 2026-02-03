// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBTvusAvL_DYO-wdETdSU3F6RWjlgRZYLI",
  authDomain: "cloud-project-389d0.firebaseapp.com",
  projectId: "cloud-project-389d0",
  storageBucket: "cloud-project-389d0.firebasestorage.app",
  messagingSenderId: "926643779377",
  appId: "1:926643779377:web:8131394fe720a0a3e16210",
  measurementId: "G-R75986HJVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
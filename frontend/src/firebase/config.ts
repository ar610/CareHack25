import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuH0PyTgbbKKpuR0B935pAaMWX3rc5JYU",
  authDomain: "cicadaauth.firebaseapp.com",
  projectId: "cicadaauth",
  storageBucket: "cicadaauth.firebasestorage.app",
  messagingSenderId: "531577159237",
  appId: "1:531577159237:web:ac2351afff3595a52f6d2c",
  measurementId: "G-SJ9LYQF6JB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 
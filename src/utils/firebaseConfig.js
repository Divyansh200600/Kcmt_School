import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBzyVTzG_DHcguLZ7z3TKhRZdMjOneyk58",
  authDomain: "school-df7b3.firebaseapp.com",
  projectId: "school-df7b3",
  storageBucket: "school-df7b3.firebasestorage.app",
  messagingSenderId: "327387439769",
  appId: "1:327387439769:web:5643cabc163c9402de0e08",
  measurementId: "G-Q5T7THZNC2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);


export { auth, firestore ,storage,database };
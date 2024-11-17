import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyARzYQxx4d0m_3b9AMyWY2RkxUn3IdgpC8",
  authDomain: "file-explorer-2a6ac.firebaseapp.com",
  projectId: "file-explorer-2a6ac",
  storageBucket: "file-explorer-2a6ac.appspot.com",
  messagingSenderId: "809629429122",
  appId: "1:809629429122:web:33b93fbb70b2ce5e41739b",
  measurementId: "G-RNFJDEKWEZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);


export { auth, firestore ,storage,database,app };
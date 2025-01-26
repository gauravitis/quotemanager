import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCGqSl7Xhocqxz0xtBQr-i8svzS6U-0eyc",
  authDomain: "erp-quotemanager.firebaseapp.com",
  projectId: "erp-quotemanager",
  storageBucket: "erp-quotemanager.firebasestorage.app",
  messagingSenderId: "643572951912",
  appId: "1:643572951912:web:8d45a39a4c20a0a16204dd",
  measurementId: "G-8057D8BC85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage }; 
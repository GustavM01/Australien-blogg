import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBZGOGj261bw4rcKxlXQxnRfmYnwBK1wig",
  authDomain: "react-blog-page-58678.firebaseapp.com",
  projectId: "react-blog-page-58678",
  storageBucket: "react-blog-page-58678.firebasestorage.app",
  messagingSenderId: "1098077244333",
  appId: "1:1098077244333:web:3e6f4504322c984b896f24",
  measurementId: "G-732NRGEXQS",
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };

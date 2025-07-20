// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCh9D1Buu-Ks_Iyba7LWkiAIuod9io8zLk",
  authDomain: "fowardafrica-8cf73.firebaseapp.com",
  databaseURL: "https://fowardafrica-8cf73-default-rtdb.firebaseio.com",
  projectId: "fowardafrica-8cf73",
  storageBucket: "fowardafrica-8cf73.appspot.com",
  messagingSenderId: "475328888787",
  appId: "1:475328888787:web:3b2dfe1e8ebd691775b926",
  measurementId: "G-3FYPVRN816"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, analytics };
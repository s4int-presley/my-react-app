// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC4ZbFXxR9TYJOEQeHYmWTTvjRUmxFmS94",
  authDomain: "presley-app-3fe3f.firebaseapp.com",
  projectId: "presley-app-3fe3f",
  storageBucket: "presley-app-3fe3f.firebasestorage.app",
  messagingSenderId: "483753330",
  appId: "1:483753330:web:37705a00b1e2f00474f1eb",
  measurementId: "G-HEXMPND0BT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
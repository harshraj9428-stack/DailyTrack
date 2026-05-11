/* ══════════════════════════════════════════════════════
   DailyTrack — firebase-config.js
   Firebase initialization and configuration
   ══════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAl1vuk2IUg_yQPeiDUpTa3prdnJvH5nK4",
  authDomain: "dailytrack-5631a.firebaseapp.com",
  projectId: "dailytrack-5631a",
  storageBucket: "dailytrack-5631a.firebasestorage.app",
  messagingSenderId: "297485581837",
  appId: "1:297485581837:web:cab0fd4fd16b705ae4df44",
  measurementId: "G-NZSE3XERZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
};

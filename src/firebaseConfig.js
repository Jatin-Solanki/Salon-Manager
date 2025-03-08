// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-uq3G1VZPd4MXrkeyi96i0c3DAljdrGY",
  authDomain: "salon-receptionist.firebaseapp.com",
  projectId: "salon-receptionist",
  storageBucket: "salon-receptionist.firebasestorage.app",
  messagingSenderId: "1090031990749",
  appId: "1:1090031990749:web:495011b4820969e32e6834",
  measurementId: "G-WCNZ83WMC7"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

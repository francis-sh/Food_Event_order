// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD50EQntKPw-CBd6o1bcUMY-IgXSbWoe_8",
  authDomain: "parabolic-wall-429207-f4.firebaseapp.com",
  projectId: "parabolic-wall-429207-f4",
  storageBucket: "parabolic-wall-429207-f4.firebasestorage.app",
  messagingSenderId: "432344806488",
  appId: "1:432344806488:web:3b5a1a0ca0c4393e64462d",
  measurementId: "G-4GNDKQ9R59"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
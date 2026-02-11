import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBDvT2rZPyA5n129hLS8stC-Xns4XLJLao",
  authDomain: "school-chat-173.firebaseapp.com",
  projectId: "school-chat-173",
  storageBucket: "school-chat-173.firebasestorage.app",
  messagingSenderId: "307920162706",
  appId: "1:307920162706:web:45f2c7299945d613417b4b"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

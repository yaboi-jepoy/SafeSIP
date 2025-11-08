// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA3zEEYgG46kHJoCr-RkWhumXBnYLyPEXo",
  authDomain: "safesip-9b4c9.firebaseapp.com",
  databaseURL: "https://safesip-9b4c9-default-rtdb.firebaseio.com",
  projectId: "safesip-9b4c9",
  storageBucket: "safesip-9b4c9.firebasestorage.app",
  messagingSenderId: "861389536962",
  appId: "1:861389536962:web:4dd70a2273a5386bdd855b"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);



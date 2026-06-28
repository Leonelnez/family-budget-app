// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDCNzmDZ2XhZuxMTD-6GgBCMSrBw4sPY5w",
  authDomain: "family-budget-app-dcc32.firebaseapp.com",
  databaseURL: "https://family-budget-app-dcc32-default-rtdb.firebaseio.com",
  projectId: "family-budget-app-dcc32",
  storageBucket: "family-budget-app-dcc32.firebasestorage.app",
  messagingSenderId: "642563091212",
  appId: "1:642563091212:web:f5f20d1553a8c9f6243729"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

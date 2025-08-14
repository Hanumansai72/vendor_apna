// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC6gurTPkbKGir997CVHG_CLSCjhWJJv6A",
  authDomain: "apna-d6ec0.firebaseapp.com",
  databaseURL: "https://apna-d6ec0-default-rtdb.firebaseio.com",
  projectId: "apna-d6ec0",
  storageBucket: "apna-d6ec0.appspot.com", // fixed incorrect domain
  messagingSenderId: "656771852412",
  appId: "1:656771852412:web:420510234d98bbffbd81f9",
  measurementId: "G-0B1DR3BX51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth for phone authentication
export const auth = getAuth(app);

// Optionally export RecaptchaVerifier
export { RecaptchaVerifier };

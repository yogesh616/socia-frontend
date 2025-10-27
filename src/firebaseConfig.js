// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDabGdECSq6wqQiyvYuUw8gJPj2-iO-JxE",
  authDomain: "askmate-519af.firebaseapp.com",
  projectId: "askmate-519af",
  storageBucket: "askmate-519af.firebasestorage.app",
  messagingSenderId: "809540334079",
  appId: "1:809540334079:web:2ae83777f9dafb86b8f7ca"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
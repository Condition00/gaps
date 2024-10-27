// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyD5sln6_LFTTqYkPQgACWlLVQ1GK0V6c5I",
  authDomain: "gaps-41219.firebaseapp.com",
  projectId: "gaps-41219",
  storageBucket: "gaps-41219.appspot.com",
  messagingSenderId: "426084014280",
  appId: "1:426084014280:web:2d935c0885ab1f87026dfd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);
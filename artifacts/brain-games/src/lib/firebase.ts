import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC4C-fpYSJYlakJNccwTwZsVHh04S31Uv8",
  authDomain: "lorapok-brainspark.firebaseapp.com",
  projectId: "lorapok-brainspark",
  storageBucket: "lorapok-brainspark.firebasestorage.app",
  messagingSenderId: "391243231957",
  appId: "1:391243231957:web:5280c753a278798bc4e85c",
  measurementId: "G-3C0EDPHERS",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

isSupported().then((yes) => {
  if (yes) getAnalytics(app);
});

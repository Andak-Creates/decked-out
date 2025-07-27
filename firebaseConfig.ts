import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDzbHFyYcufqgRbevcL_HhV55Q8sRxYswk",
  authDomain: "decked-out-d54e9.firebaseapp.com",
  projectId: "decked-out-d54e9",
  storageBucket: "decked-out-d54e9.firebasestorage.app",
  messagingSenderId: "667642045422",
  appId: "1:667642045422:web:9fc364bed6911cc46a64ff",
  measurementId: "G-LWZYV9X24G",
};

// Prevent re-initialization during hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Auth once
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If already initialized (e.g. during fast refresh), fallback to getAuth
  auth = getAuth(app);
}

export { app, auth };

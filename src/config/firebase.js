// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG, APP_VERSION, GEMINI_KEY } from './env';

// Initialisation
const app = initializeApp(FIREBASE_CONFIG);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const APP_NAMESPACE = APP_VERSION;
export const VITE_GEMINI_API_KEY = GEMINI_KEY;

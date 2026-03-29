// src/config/env.js
const getEnv = (key) => {
  try { return import.meta.env[key] || ""; } catch (e) { return ""; }
};

export const FIREBASE_CONFIG = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

export const GEMINI_KEY = getEnv('VITE_GEMINI_API_KEY');
export const APP_VERSION = 'argumentis-prod-v1';

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
};

export function getMissingFirebaseEnvKeys() {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
    missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  }
  return missing;
}

function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket,
    messagingSenderId,
    measurementId,
  };
}

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config) return null;
  try {
    return getApps().length > 0 ? getApp() : initializeApp(config);
  } catch {
    return null;
  }
}

export function getDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getVehiclesCollectionName() {
  return process.env.NEXT_PUBLIC_FIREBASE_VEHICLES_COLLECTION || "vehicles";
}

export function getBrandsCollectionName() {
  return process.env.NEXT_PUBLIC_FIREBASE_BRANDS_COLLECTION || "brands";
}

export function getModelsCollectionName() {
  return process.env.NEXT_PUBLIC_FIREBASE_MODELS_COLLECTION || "models";
}

export function hasFirebaseEnv() {
  return getFirebaseConfig() !== null;
}

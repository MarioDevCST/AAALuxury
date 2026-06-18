import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function signInAdmin(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase Auth no está configurado.");
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}


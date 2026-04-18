// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import {
  auth, db, googleProvider, doc, getDoc, setDoc,
  COLLECTIONS, Timestamp,
} from '../firebase';
import {
  onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, User,
} from 'firebase/auth';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, COLLECTIONS.USERS, u.uid));
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: u.uid,
            displayName: u.displayName || 'ゲスト',
            photoUrl: u.photoURL || undefined,
            role: 'user',
            reviewCount: 0,
            createdAt: new Date(),
          };
          await setDoc(doc(db, COLLECTIONS.USERS, u.uid), {
            ...newProfile,
            createdAt: Timestamp.now(),
          });
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      await signInWithRedirect(auth, googleProvider);
    }
  };

  const signInWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUpWithEmail = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return { user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout };
}

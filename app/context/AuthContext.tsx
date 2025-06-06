// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser,
} from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';

import { auth } from '../../lib/firebase';
import { useUserStore } from '../../lib/store/useStore';
import { UserData } from '../../lib/types';
import { getUserDocRef } from '../../lib/userService';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    let unsubscribeUserSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      if (user) {
        const userRef = getUserDocRef(user.uid);
        unsubscribeUserSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as UserData;
            setUser(userData);
          }
        });
      } else {
        clearUser();
        if (unsubscribeUserSnapshot) {
          unsubscribeUserSnapshot();
          unsubscribeUserSnapshot = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserSnapshot) {
        unsubscribeUserSnapshot();
      }
    };
  }, [setUser, clearUser]);

  // 注册
  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('注册失败', error.message ?? error);
    }
  };

  // 登录
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('登录失败', error.message ?? error);
    }
  };

  // 登出
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user: firebaseUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

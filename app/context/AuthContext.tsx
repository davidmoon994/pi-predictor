// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { app } from "@lib/firebase";

// 定义用户类型
interface UserInfo {
  name: string;
  email: string;
}

// 定义上下文类�?
interface AuthContextType {
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 创建上下�?
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const name = firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "用户";
        setUser({
          name,
          email: firebaseUser.email || "未知邮箱",
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    router.push("/");
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
    router.push("/");
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定�?Hook，方便使用上下文
export const useAuth = () => useContext(AuthContext);

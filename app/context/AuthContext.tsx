// context/AuthContext.tsx
"use client"
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@lib/firebase"; // Firebase 配置文件
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// 创建 Context
const AuthContext = createContext<any>(null);

// 使用 useAuth 钩子
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  // 监听认证状态的变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // 用户已登录
      } else {
        setUser(null); // 用户未登录
      }
    });

    return () => unsubscribe(); // 清理监听器
  }, []);

  // 用户注册
  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("注册失败", error.message);
      } else {
        console.error("注册失败，发生未知错误");
      }
    }
    };

  // 用户登录
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("登录失败", error.message);
      } else {
        console.error("登录失败，发生未知错误");
      }
    }
  };

  // 用户登出
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

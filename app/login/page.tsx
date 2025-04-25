"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // <--- 关键在这�?

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/"); // 登录成功后跳转回首页
    } catch (err: any) {
      setError("登录失败�? + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl mb-6 text-center">登录</h1>

        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-gray-700 text-white"
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded bg-gray-700 text-white"
        />
        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded">
          登录
        </button>

        <p className="mt-4 text-center text-sm">
          还没有账号？{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            点击注册
          </Link>
        </p >
      </form>
    </div>
  );
}

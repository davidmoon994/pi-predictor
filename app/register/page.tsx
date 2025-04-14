"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebase"; // 确保你有这个文件
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [referrer, setReferrer] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferrer(ref);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 生成邀请码（也可以直接用 uid）
      const myInviteCode = uid.slice(0, 6).toUpperCase();

      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        inviteCode: myInviteCode,
        invitedBy: referrer || null,
        createdAt: new Date(),
      });

      alert("注册成功！");
      // 可跳转到首页或用户中心页面
    } catch (error: any) {
      console.error("注册失败", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <form onSubmit={handleRegister} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">注册账号</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          required
          className="w-full p-2 mb-3 bg-gray-700 rounded"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          required
          className="w-full p-2 mb-3 bg-gray-700 rounded"
        />

        {referrer && (
          <p className="text-sm text-green-400 mb-2">邀请人：{referrer}</p >
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "注册中..." : "立即注册"}
        </button>
      </form>
    </div>
  );
}
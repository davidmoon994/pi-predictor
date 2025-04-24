"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "@lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitedBy = searchParams.get("ref");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 生成唯一邀请码
      const inviteCode = nanoid(6).toUpperCase();

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
        inviteCode,
        invitedBy: invitedBy || null,
        createdAt: new Date(),
      });

      router.push("/user");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">注册账号</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block mb-3 px-4 py-2 rounded bg-gray-800 w-full"
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block mb-3 px-4 py-2 rounded bg-gray-800 w-full"
      />
      <button onClick={handleRegister} className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700">
        注册
      </button>
    </div>
  );
}

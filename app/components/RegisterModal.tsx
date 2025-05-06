// components/RegisterModal.tsx
"use client";
import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function RegisterModal({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("注册失败");
      alert("注册成功！");
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">注册新账号</h2>
        <input
          type="text"
          placeholder="昵称"
          className="border p-2 w-full mb-2"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          type="email"
          placeholder="邮箱"
          className="border p-2 w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="密码"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">取消</button>
          <button onClick={handleRegister} className="px-4 py-2 bg-blue-500 text-white rounded">注册</button>
        </div>
      </div>
    </div>
  );
}

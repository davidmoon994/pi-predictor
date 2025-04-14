// components/Navbar.tsx
"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-yellow-400 hover:text-yellow-300 transition duration-300">
        Pi币值预测有奖竞猜
      </Link>

      <div className="space-x-4">
        {!user ? (
          <Link
            href="/login"
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded transition duration-300"
          >
            注册 / 登录
          </Link>
        ) : (
          <>
            <span className="px-3 py-2 text-green-400 font-medium">
              欢迎，{user.email}
            </span>
            <Link
              href="/user"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded transition duration-300"
            >
              用户中心
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition duration-300"
            >
              退出
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
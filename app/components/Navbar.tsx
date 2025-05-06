"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import RegisterModal from "@/components/RegisterModal"; // 你需要创建这个组件

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false); // 控制弹窗显示

  const handleLogout = async () => {
    await logout();
    router.push("/login"); // 可以跳回首页或登录页
  };

  return (
    <>
      <nav className="bg-gray-900 text-white p-4 shadow-lg flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-yellow-400 hover:text-yellow-300 transition duration-300"
        >
          Pi币值预测有奖竞猜
        </Link>

        <div className="space-x-4">
          {!user ? (
            <>
              <button
                onClick={() => setShowRegister(true)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded transition duration-300"
              >
                注册 / 登录
              </button>
              {/* 注册弹窗 */}
              {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
            </>
          ) : (
            <>
              <span className="px-3 py-2 text-green-400 font-medium">
                欢迎，{user.email}
              </span>
              <Link
                href="/userCenter"
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
    </>
  );
}

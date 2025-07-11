// app/components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useKlineData } from '@/hooks/useKlineData';
import { useKlineStore } from "../../lib/store/klineStore";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [selectedToken, setSelectedToken] = useState("PI");

  // ✅ 初始化拉取行情数据（内部自带 useEffect）
  useKlineData();

  // ✅ 直接从 Zustand 中读取 close（收盘价）
  const close = useKlineStore((s) => s.latest?.close);
  // ✅ 处理价格显示
  let displayPrice = "--";
  if (close !== undefined) {
    displayPrice =
      selectedToken === "PI"
        ? close.toFixed(4)               // Pi/USDT
        : (close * 7.2).toFixed(2);      // Pi/CNY（假设汇率 7.2）
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* 左侧 Logo 与价格选择器 */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <img
              src="/pi-network.gif"
              alt="Pi Network"
              className="w-8 h-8 rounded-sm"
            />
          </Link>

          <div className="flex items-center space-x-4">
            <select
              className="bg-amber-300 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              <option value="PI">Pi/USDT</option>
              <option value="PI-CNY">Pi/CNY</option>
            </select>

            <span className="text-green-400 font-semibold text-lg">
              价格 {displayPrice}
            </span>
          </div>
        </div>

        {/* 右侧按钮区域 */}
        <div className="space-x-4 flex items-center">
          {!user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-medium transition"
              >
                注册
              </Link>
            </>
          ) : (
            <>
              <span className="text-green-400 font-medium hidden sm:inline">
                欢迎，{user.email}
              </span>
              <Link
                href="/userCenter"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-medium transition"
              >
                用户中心
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition"
              >
                退出
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

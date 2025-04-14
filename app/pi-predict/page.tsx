"use client";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1>Pi 大陆</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-200 p-4">开奖信息、奖池情况、倒计时</div>
        <div className="bg-gray-300 p-4">Pi K 线图</div>
      </div>
    </div>
  );
}
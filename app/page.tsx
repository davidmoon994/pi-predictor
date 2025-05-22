"use client";
import { getCurrentPeriodId } from "@lib/utils";
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import KLineChart from "./components/KLineChart";
import CardSlider from "./components/CardSlider";
import { getKlineFromFirestore } from "../lib/getKlineFromFirestore";
import { auth } from "../lib/firebase"; // ✅ 确保这个路径正确

type KlineItem = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type CandleData = {
  timestamp: number;
  open: string;
  close: string;
  high: string;
  low: string;
};

type PredictionItem = {
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
};

type User = {
  uid: string;
  displayName: string;
  email?: string;
};

export default function HomePage() {
  const [price, setPrice] = useState("3.14");
  const [selectedToken, setSelectedToken] = useState("PI");
  const [klineData, setKlineData] = useState<KlineItem[]>([]);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [user, setUser] = useState<User | null>(null); // ✅ 添加 user 状态

  useEffect(() => {
    // ✅ 监听 Firebase 登录状态
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("/api/kline");
      const result = await res.json();
      const rawData = result.data;

      if (!Array.isArray(rawData)) {
        console.error("❌ K线数据格式不正确:", rawData);
        return;
      }

      const formattedData = rawData.map((item: any) => ({
        time: new Date(Number(item.timestamp) * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
      }));
      setKlineData(formattedData);

      if (formattedData.length > 0) {
        setPrice(formattedData[formattedData.length - 1].close.toFixed(4));
      }

      const chartFormatted = rawData.map((item: any) => ({
        timestamp: Number(item.timestamp),
        open: item.open,
        close: item.close,
        high: item.high,
        low: item.low,
      }));
      setChartData(chartFormatted);
    } catch (err) {
      console.error("获取K线数据失败", err);
    }

    try {
      const currentPeriodId = getCurrentPeriodId(); // ✅ 动态生成期号
      const predictionRes = await getKlineFromFirestore(currentPeriodId);
      setPredictions(Array.isArray(predictionRes) ? predictionRes : []);
    } catch (error) {
      console.error("获取预测数据失败", error);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 60000);
  return () => clearInterval(interval);
}, []);

  return (
    <main
      className="relative flex flex-col items-center px-4 py-6 space-y-6 min-h-screen text-white bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/page.jpg')" }}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* 内容区域 */}
      <div className="relative z-10 w-full flex flex-col items-center space-y-6">
        <CardSlider
          user={user}
          onPeriodEnd={() => {
            console.log("当前期结束，执行回调逻辑");
            // 你可以在这里触发刷新数据、弹窗、声音提示等逻辑
          }}
        />

        <div className="w-full h-[250px] bg-white text-gray-800 px-4 sm:px-8 py-4 shadow-lg">
          <KLineChart data={chartData} currentPrice={price} />
        </div>

        <div className="w-full flex justify-center gap-6 bg-gray-800/80 py-3 rounded-xl shadow">
          <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">Pi NFT</button>
          <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">Pi 金融</button>
          <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">更多功能</button>
        </div>

        <div className="h-12" />
      </div>
    </main>
  );
}

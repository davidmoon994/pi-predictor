"use client";

import React, { useState, useEffect } from "react";
import { getPiPredictions } from "@lib/getPiPredictions";
import Navbar from "./components/Navbar";
import KLineChart from "./components/KLineChart";
import CardSlider from "./components/CardSlider";

type KlineItem = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type PredictionItem = {
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
};

export default function HomePage() {
  const [price, setPrice] = useState("3.14");
  const [selectedToken, setSelectedToken] = useState("PI");
  const [klineData, setKlineData] = useState<KlineItem[]>([]);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/kline");
        const rawData = await res.json();

        const formattedData = rawData.map((item: any) => ({
          time: new Date(item[0] * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          open: parseFloat(item[2]),
          high: parseFloat(item[3]),
          low: parseFloat(item[4]),
          close: parseFloat(item[5]),
        }));

        setKlineData(formattedData);

        if (formattedData.length > 0) {
          setPrice(formattedData[formattedData.length - 1].close.toFixed(4));
        }
      } catch (err) {
        console.error("获取K线数据失败", err);
      }

      try {
        const predictionRes = await getPiPredictions();
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
  
      {/* 内容区域（在遮罩之上） */}
      <div className="relative z-10 w-full flex flex-col items-center space-y-6">
        {/* 卡片滑动组件 */}
        <CardSlider />
  
        {/* K线图组件 */}
        <KLineChart />
  
        {/* 底部按钮 */}
        <div className="w-full flex justify-center gap-6 bg-gray-800/80 py-3 rounded-xl shadow">
          <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">Pi NFT</button>
          <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">Pi 金融</button>
          <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">更多功能</button>
        </div>
  
        {/* 占位防止遮挡 */}
        <div className="h-12"></div>
      </div>
    </main>
  );
}

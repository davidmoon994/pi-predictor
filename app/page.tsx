"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import KLineChart from "./components/KLineChart";
import CardSlider from "./components/CardSlider";
import { getKlineFromFirestore } from "../lib/getKlineFromFirestore";

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

export default function HomePage() {
  const [price, setPrice] = useState("3.14");
  const [selectedToken, setSelectedToken] = useState("PI");
  const [klineData, setKlineData] = useState<KlineItem[]>([]);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);

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

        // 用于展示卡片用数据
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

        // 设置当前价格
        if (formattedData.length > 0) {
          setPrice(formattedData[formattedData.length - 1].close.toFixed(4));
        }

        // Page.tsx 图表数据部分修改
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
        const predictionRes = await getKlineFromFirestore();
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
        <CardSlider />

        {/* ✅ 修复后的图表数据 */}
        <div className="w-full h-[250px] bg-white text-gray-800 px-4 sm:px-8 py-4 shadow-lg">
          <KLineChart data={chartData} currentPrice={price} />
        </div>

        {/* 按钮区域 */}
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

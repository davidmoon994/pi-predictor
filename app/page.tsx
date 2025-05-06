"use client";

import React, { useState, useEffect } from "react";
import { getPiPredictions } from "@lib/getPiPredictions";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import KLineChart from "./components/KLineChart";
import CardSlider from "./components/CardSlider";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function HomePage() {
  const [price, setPrice] = useState("3.14");
  const [selectedToken, setSelectedToken] = useState("PI");
  const [klineData, setKlineData] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("api/kline");
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
    <main className="flex flex-col items-center px-4 py-6 space-y-6 bg-gradient-to-b from-gray-900 via-gray-950 to-black min-h-screen text-white">
      {/* 第一行：圆角按钮 + 币种选择 + 实时价格 */}
      <div className="w-full flex justify-between items-center bg-gray-800 rounded-xl px-4 py-2 shadow">
        <button className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600">
          操作按钮
        </button>
        <div className="flex items-center space-x-4">
          <select
            className="bg-gray-700 text-white px-3 py-2 rounded"
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            <option value="PI">Pi/USDT</option>
            <option value="PI-CNY">Pi/CNY</option>
          </select>
          <span className="text-green-400 font-semibold">
            实时价格 {price}
          </span>
        </div>
      </div>

      {/* 第二行：箭头组件（预留） */}

      {/* 第三行：卡片组件 */}
      <CardSlider />

      {/* 第四行：K线图组件 */}
      <KLineChart predictions={predictions} />

      {/* 第五行：底部菜单 */}
      <div className="w-full flex justify-center gap-6 bg-gray-800 py-3 rounded-xl shadow">
        <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">
          Pi NFT
        </button>
        <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">
          Pi 金融
        </button>
        <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">
          更多功能
        </button>
      </div>

      {/* 第六行：底部占位 */}
      <div className="h-12"></div>
    </main>
  );
}

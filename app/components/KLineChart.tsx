"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import "chartjs-adapter-date-fns";
import { fetchLatestKlines } from "@/lib/klineApi";

// 注册 Chart.js 和金融图表组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

const KLineChart = ({ className }: { className?: string }) => {
  const [klineData, setKlineData] = useState<any[]>([]);

  const fetchData = async () => {
    const result = await fetchLatestKlines(50); // 获取最近 50 根 K 线
    if (result && Array.isArray(result)) {
      const formatted = result.map((item: any) => ({
        x: new Date(item.timestamp),
        o: parseFloat(item.open),
        h: parseFloat(item.high),
        l: parseFloat(item.low),
        c: parseFloat(item.close),
      }));
      setKlineData(formatted);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 每分钟刷新
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    datasets: [
      {
        label: "PI/USDT",
        data: klineData,
        borderColor: "#00cc99",
        color: {
          up: "#00ff99",
          down: "#ff3366",
          unchanged: "#999999",
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "minute",
          tooltipFormat: "yyyy-MM-dd HH:mm",
        },
        ticks: { color: "#666" },
        grid: { color: "#eee" },
      },
      y: {
        ticks: { color: "#666" },
        grid: { color: "#eee" },
      },
    },
  };

  return (
    <div className={className || "w-full h-[400px]"}>
      <Chart
        type="candlestick"
        data={chartData}
        options={chartOptions}
        style={{ height: "100%", backgroundColor: "white", borderRadius: "8px" }}
      />
    </div>
  );
};

export default KLineChart;

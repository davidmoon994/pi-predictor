'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import { fetchLatestKlines } from "@/lib/klineApi"; // 引入 API 请求

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  CandlestickController,
  CandlestickElement
);

type Props = {
  className?: string;
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
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

const KLineChart = ({ className }: Props) => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [{
      label: "PI/USDT",
      data: [],
      borderColor: "#00cc99",
      backgroundColor: "#00cc99",
    }],
  });

  const fetchData = async () => {
    const result = await fetchLatestKlines(); // 从 API 获取 K 线数据
    if (result && result.length > 0) {
      const formattedData = result.map((item: any) => ({
        x: new Date(item.timestamp), // 使用时间戳作为 x 轴标签
        o: parseFloat(item.open),
        h: parseFloat(item.high),
        l: parseFloat(item.low),
        c: parseFloat(item.close),
      }));

      // 更新 chartData
      setChartData({
        labels: formattedData.map((data) => data.x), // 时间戳作为标签
        datasets: [{
          label: "PI/USDT",
          data: formattedData,
          borderColor: "#00cc99",
          backgroundColor: "#00cc99",
        }],
      });
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className || "w-full h-[400px]"}>
      <Chart
        type="candlestick"
        data={chartData}
        options={chartOptions}
        style={{
          height: "100%",
          backgroundColor: "white",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default KLineChart;

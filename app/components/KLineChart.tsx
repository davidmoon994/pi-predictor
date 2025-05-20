// app/components/KLineChart.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

export default function KLineChart({ data = [], currentPrice = "" }) {
  const [isZoomReady, setIsZoomReady] = useState(false);

  useEffect(() => {
    // 动态导入 zoom 插件，避免 SSR 错误
    import("chartjs-plugin-zoom").then((zoomPluginModule) => {
      const zoomPlugin = zoomPluginModule.default;
      ChartJS.register(zoomPlugin);
      setIsZoomReady(true);
    });
  }, []);

  if (!isZoomReady) return null; // 或者 return <Loading />

  const candleData = data.map((item: any) => ({
    x: item.timestamp * 1000,
    o: parseFloat(item.open),
    h: parseFloat(item.high),
    l: parseFloat(item.low),
    c: parseFloat(item.close),
  }));

  const volumeData = data.map((item: any) => ({
    x: item.timestamp * 1000,
    y: parseFloat(item.volume ?? 0),
  }));

  const maxVolume = Math.max(...volumeData.map((d) => d.y), 100);

  const chartData = {
    datasets: [
      {
        label: "价格",
        type: "candlestick",
        data: candleData,
        yAxisID: "y",
        upColor: "#00ff00",
        downColor: "#ff3b30",
        borderColor: "#00ff00",
        borderDownColor: "#ff3b30",
        wickColor: "#ffffff",
        borderWidth: 1.5,
      },
      {
        label: "成交量",
        type: "bar",
        data: volumeData,
        yAxisID: "y1",
        backgroundColor: "rgba(255, 193, 7, 0.7)",
        borderColor: "rgba(255, 193, 7, 1)",
        borderWidth: 1,
        barThickness: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          tooltipFormat: "HH:mm",
        },
        ticks: { color: "#facc15" },
        grid: { display: false },
      },
      y: {
        position: "right",
        title: {
          display: true,
          text: "价格",
        },
        ticks: {
          color: "#22c55e",
        },
      },
      y1: {
        position: "left",
        title: {
          display: true,
          text: "成交量",
        },
        ticks: {
          color: "#facc15",
        },
        beginAtZero: true,
        suggestedMax: maxVolume * 1.2,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        labels: { color: "#facc15" },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "230px" }}>
      <Chart type="candlestick" data={chartData} options={options} />
    </div>
  );
}

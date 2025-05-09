//app/components/KLineChart.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  TimeScale,
  Tooltip,
  LinearScale,
  Title,
  ChartOptions
} from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { Chart } from 'react-chartjs-2';
import { getKlineFromFirestore } from '@lib/getKlineFromFirestore';
import { getPiPredictions } from '@lib/getPiPredictions';

ChartJS.register(
  CandlestickController,
  CandlestickElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Title
);

interface KlineItem {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function KLineChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [prediction, setPrediction] = useState<KlineItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const firestoreData = await getKlineFromFirestore();

        const formattedData = firestoreData.map((item: any) => ({
          x: new Date(item.timestamp),
          o: item.open,
          h: item.high,
          l: item.low,
          c: item.close,
        }));

        setChartData({
          datasets: [
            {
              label: 'Pi/USDT 5分钟蜡烛图',
              data: formattedData,
              borderColor: 'rgba(0, 0, 0, 1)',
              color: {
                up: 'rgba(0, 200, 5, 1)',
                down: 'rgba(255, 0, 0, 1)',
                unchanged: 'gray'
              }
            }
          ]
        });
      } catch (error) {
        console.error('加载 K 线数据失败:', error);
      }

      try {
        const predictions = await getPiPredictions();
        const latest = predictions?.[0] || null;
        setPrediction(latest);
      } catch (err) {
        console.error('加载预测数据失败:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const options: ChartOptions<'candlestick'> = {
    responsive: true,
    maintainAspectRatio: false, // 关键：允许容器控制高宽比
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: false,
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  if (!chartData) return <div>图表加载中...</div>;

  return (
    <div className="bg-white p-4 rounded shadow w-full">

      <h2 className="text-xl font-bold mb-4">Pi 币 5 分钟蜡烛图</h2>

      {/* 自适应容器（关键：aspect-[6/1]） */}
      <div className="relative w-full aspect-6/1]">
        <Chart type="candlestick" data={chartData} options={options} />
      </div>

      {/* 预测数据展示 */}
      {prediction && (
  <div className="flex flex-wrap text-sm text-gray-700 gap-x-4 mt-4">
    <span>时间：{new Date(prediction.timestamp).toLocaleTimeString()}</span>
    <span>预测收盘价：{prediction.close}</span>
  </div>
)}

    </div>
  );
}

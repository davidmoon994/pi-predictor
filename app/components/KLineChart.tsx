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
        const latestPrediction = await getPiPredictions(); // 返回单条对象或 null
        setPrediction(latestPrediction);
      } catch (err) {
        console.error('加载预测数据失败:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // 每分钟刷新
    return () => clearInterval(interval);
  }, []);

  const options: ChartOptions<'candlestick'> = {
    responsive: true,
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
    <div className="bg-white p-4 rounded shadow w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Pi 币 5 分钟蜡烛图</h2>
      <Chart type="candlestick" data={chartData} options={options} />

      <div className="mt-6 bg-gray-50 p-4 rounded border border-gray-200">
        <h3 className="text-md font-semibold mb-2">最新预测数据：</h3>
        {!prediction ? (
          <p className="text-gray-500">暂无预测数据</p>
        ) : (
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>
              时间：{new Date(prediction.timestamp).toLocaleTimeString()}，
              预测收盘价：{prediction.close}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

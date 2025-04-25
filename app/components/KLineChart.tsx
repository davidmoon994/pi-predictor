'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

interface KlineItem {
  timestamp: number;
  close: string;
}

export default function KLineChart() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/kline/route');
        const json = await res.json();

        const formattedData: KlineItem[] = json.data.map((item: any[]) => ({
          timestamp: item[0] * 1000, // 毫秒时间戳
          close: item[5],
        }));

        setChartData({
          labels: formattedData.map((d) => new Date(d.timestamp)),
          datasets: [
            {
              label: 'PI/USDT',
              data: formattedData.map((d) => parseFloat(d.close)),
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error('图表数据获取失败:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // 每分钟刷新一次
    return () => clearInterval(interval);
  }, []);

  if (!chartData) {
    return <div>加载中...</div>;
  }

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Pi 币五分钟 K 线图</h2>
      <Line
        data={chartData}
        options={{
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
        }}
      />
    </div>
  );
}


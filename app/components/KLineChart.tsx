'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { fetchLatestKlines } from '@/lib/klineApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  CandlestickController,
  CandlestickElement
);

type FormattedData = {
  x: Date;
  o: number;
  h: number;
  l: number;
  c: number;
};

const KLineChart = () => {
  const [chartData, setChartData] = useState({
    labels: [] as Date[],
    datasets: [
      {
        label: 'PI/USDT',
        data: [] as FormattedData[],
        borderColor: '#00cc99',
        backgroundColor: '#00cc99',
      },
    ],
  });

  const fetchData = async () => {
    const result = await fetchLatestKlines();
    if (result && result.length > 0) {
      const formattedData: FormattedData[] = result.map((item: any) => ({
        x: new Date(item.timestamp),
        o: parseFloat(item.open),
        h: parseFloat(item.high),
        l: parseFloat(item.low),
        c: parseFloat(item.close),
      }));

      setChartData({
        labels: formattedData.map((data: FormattedData) => data.x),
        datasets: [
          {
            label: 'PI/USDT',
            data: formattedData,
            borderColor: '#00cc99',
            backgroundColor: '#00cc99',
          },
        ],
      });
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[400px]">
      <Chart
        type="candlestick"
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'minute',
                tooltipFormat: 'yyyy-MM-dd HH:mm',
              },
              ticks: { color: '#666' },
              grid: { color: '#eee' },
            },
            y: {
              ticks: { color: '#666' },
              grid: { color: '#eee' },
            },
          },
        }}
      />
    </div>
  );
};

export default KLineChart;

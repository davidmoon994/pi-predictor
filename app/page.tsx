'use client';

import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import KLineChart from './components/KLineChart';
import CardSlider from './components/CardSlider';
import { auth } from '../lib/firebase';
import { useUserStore } from '../lib/store/useStore';
import { useKlineStore } from '../lib/store/klineStore';
import { useKlineData } from '@/hooks/useKlineData';
import { UserData } from '@lib/types';
import type { UTCTimestamp } from 'lightweight-charts';

export default function HomePage() {
  useKlineData(); // ✅ 初始化 + 每分钟自动更新

  const [price, setPrice] = useState('0.00');
  const [user, setUser] = useState<UserData | null>(null);

  const points = useUserStore((state) => state.points);
  const history = useKlineStore((s) => s.history);
const latest = useKlineStore((s) => s.latest);
const klineData = [...history, ...(latest ? [latest] : [])];

  // ✅ 登录监听
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          inviteCode: '',
          inviteUrl: '',
          qrCodeUrl: '',
          createdAt: Date.now(),
          points: 0,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ 更新当前价格
  useEffect(() => {
    if (latest) {
      setPrice(latest.close.toFixed(4));
    }
  }, [latest]); // 👈 只监听 latest，最安全
  

  // ✅ 去重 + 排序
  const uniqueSortedData = [...klineData]
    .filter((d, i, arr) => i === 0 || d.timestamp !== arr[i - 1].timestamp)
    .sort((a, b) => a.timestamp - b.timestamp);

  // ✅ 转换为图表格式
  const chartData = uniqueSortedData.map((item) => ({
    time: item.timestamp as UTCTimestamp,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }));

  return (
    <>
      <Navbar />

      <main
        className="relative flex flex-col items-center px-4 py-6 space-y-6 min-h-screen text-white bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/page.jpg')" }}
      >
        <div className="absolute top-4 right-4 z-40 bg-yellow-500 text-white px-4 py-1 rounded-full shadow text-sm font-semibold">
          余额: {points}
        </div>

        <div className="absolute inset-0 bg-black/70 z-0" />

        <div className="relative z-10 w-full flex flex-col items-center space-y-6">
          <CardSlider
            user={user}
            onPeriodEnd={() => {
              console.log('当前期结束，执行回调逻辑');
            }}
          />

          <div className="w-full h-[250px] bg-white text-gray-800 px-4 sm:px-8 py-4 shadow-lg">
            <KLineChart data={chartData} />
          </div>

          <div className="w-full flex justify-center gap-6 bg-gray-800/80 py-3 rounded-xl shadow">
            <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">Pi NFT</button>
            <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">Pi 金融</button>
            <button className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white">更多功能</button>
          </div>

          <div className="h-12" />
        </div>
      </main>
    </>
  );
}

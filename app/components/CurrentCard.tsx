'use client';
import { useState, useEffect } from 'react';
import { placeBet } from "@lib/betService";
import { drawAndSettle } from "@lib/drawService";

const CurrentCard = ({ period }: { period: string }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 初始300秒
  const [selection, setSelection] = useState<'up' | 'down' | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [hasPoints, setHasPoints] = useState(true);
  const [userPoints, setUserPoints] = useState(888); // 假设积分为888
  const [betAmount, setBetAmount] = useState('');
  const [drawTriggered, setDrawTriggered] = useState(false);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [openPrice, setOpenPrice] = useState<number | null>(null);

  // 客户端 fetch 方式获取 K 线数据
  const fetchKlineData = async () => {
    try {
      const res = await fetch('/api/kline');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setLatestPrice(data.close);
      setOpenPrice(data.open);
    } catch (error) {
      console.error('Failed to fetch Kline data:', error);
    }
  };

  useEffect(() => {
    fetchKlineData();
    const interval = setInterval(fetchKlineData, 60000); // 每分钟更新
    return () => clearInterval(interval);
  }, []);

  // 倒计时更新
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // 格式化时间
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // 开奖逻辑
  useEffect(() => {
    if (timeLeft === 0 && latestPrice && openPrice && !drawTriggered) {
      setDrawTriggered(true);
      drawAndSettle(period, openPrice, latestPrice);
    }
  }, [timeLeft, latestPrice, openPrice, drawTriggered, period]);

  return (
    <div className="relative">
      <div className="rounded-[30px] bg-gradient-to-br from-pink-200 via-purple-100 to-yellow-100 p-5 border-[3px] border-pink-400 shadow-[0_10px_30px_rgba(255,140,255,0.4)] hover:shadow-pink-500/60 transition-shadow duration-300 text-gray-800">
        
        {/* 顶部信息 */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-purple-800">期号：{period}</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-yellow-700 font-bold">积分：{userPoints}</span>
            <span className="font-mono text-pink-600 bg-white/70 px-2 py-1 rounded-lg shadow">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="w-full bg-white/70 rounded-full h-2.5 mb-4">
          <div className="bg-pink-400 h-2.5 rounded-full" style={{ width: `${(300 - timeLeft) / 3}%` }}></div>
        </div>

        {/* 买涨区域 */}
        <div className="flex justify-between items-center mb-2 px-6">
          <div className="w-full h-20 bg-green-100 rounded-t-full flex items-center justify-between px-6 shadow-md">
            <span className="text-green-800 text-lg font-bold">UP</span>
            <button
              onClick={() => {
                if (userPoints > 0) {
                  const amount = prompt(`当前积分：${userPoints}\n请输入买涨金额：`);
                  if (amount) {
                    alert(`成功投注 ${amount} Pi（买涨）`);
                  }
                } else {
                  alert("当前积分为 0，请先充值！");
                }
              }}
              className="flex items-center space-x-1 border border-green-700 bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 rounded-full shadow transition"
            >
              <span>↑</span>
              <span>买涨</span>
            </button>
          </div>
        </div>

        {/* 中间信息块 */}
        <div className="relative h-28 bg-gradient-to-br from-[#2e2e47] to-[#3c3c5a] border-[3px] border-dashed border-purple-400 rounded-lg p-4 mb-3 shadow-xl cartoon-border">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/bubble-bg.png')] bg-cover opacity-10 rounded-lg z-0" />
          <div className="relative z-10 space-y-1">
            <div className="text-sm text-white">收盘价：<span className="text-yellow-400 font-bold">{latestPrice || '加载中...'}</span></div>
            <div className="text-sm text-white">奖池总金额：<span className="text-green-400 font-bold">666</span></div>
            <div className="text-sm text-white">开盘价：<span className="text-blue-400 font-bold">{openPrice || '加载中...'}</span></div>
          </div>
        </div>

        {/* 买跌区域 */}
        <div className="flex justify-between items-center mt-1 px-6">
          <div className="w-full h-20 bg-red-100 rounded-b-full flex items-center justify-between px-6 shadow-md">
            <span className="text-red-800 text-lg font-bold">DOWN</span>
            <button
              onClick={() => {
                if (userPoints > 0) {
                  const amount = prompt(`当前积分：${userPoints}\n请输入买跌金额：`);
                  if (amount) {
                    alert(`成功投注 ${amount} Pi（买跌）`);
                  }
                } else {
                  alert("当前积分为 0，请先充值！");
                }
              }}
              className="flex items-center space-x-1 border border-red-700 bg-red-400 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow transition"
            >
              <span>↓</span>
              <span>买跌</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CurrentCard;

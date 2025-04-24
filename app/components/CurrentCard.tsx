'use client';
import { useState, useEffect } from 'react';
import { placeBet } from "@/lib/betService";
import { drawAndSettle } from "@/lib/drawService";
import { fetchLatestKlines } from "@/lib/klineApi"; // 引入 K 线 API
import { fetchLatestPiPrice } from '@/lib/klineApi';

const handleDraw = async () => {
  const latestPrice = await fetchLatestPiPrice();
  if (latestPrice !== null) {
    drawAndSettle(latestPrice, cardData, userBets); // 示例
  }
};

const CurrentCard = ({ period }: { period: string }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 初始300秒
  const [selection, setSelection] = useState<'up' | 'down' | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [hasPoints, setHasPoints] = useState(true);
  const [userPoints, setUserPoints] = useState(888); // 假设积分为 888
  const [betAmount, setBetAmount] = useState('');
  const [drawTriggered, setDrawTriggered] = useState(false);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [openPrice, setOpenPrice] = useState<number | null>(null);

  // 获取最新的 Pi K 线数据（开盘价和收盘价）
  useEffect(() => {
    const fetchPrice = async () => {
      const price = await fetchLatestKlines();
      if (price) {
        setLatestPrice(price.close); // 更新最新收盘价
        setOpenPrice(price.open);  // 设置开盘价
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // 每分钟更新一次
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

  // 倒计时结束时触发开奖
  useEffect(() => {
    if (timeLeft === 0 && latestPrice && openPrice && !drawTriggered) {
      setDrawTriggered(true);
      drawAndSettle(period, openPrice, latestPrice);  // 传入期号、开盘价和收盘价
    }
  }, [timeLeft, latestPrice, openPrice, drawTriggered, period]);

  return (
    <div className="relative">
      <div className="rounded-[30px] bg-gradient-to-br from-pink-200 via-purple-100 to-yellow-100 p-5 border-[3px] border-pink-400 shadow-[0_10px_30px_rgba(255,140,255,0.4)] hover:shadow-pink-500/60 transition-shadow duration-300 text-gray-800">
        
        {/* 顶部：期号 + 倒计时 + 当前积分 */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-purple-800">期号：{period}</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-yellow-700 font-bold">积分：{userPoints}</span>
            <span className="font-mono text-pink-600 bg-white/70 px-2 py-1 rounded-lg shadow">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-white/70 rounded-full h-2.5 mb-4">
          <div className="bg-pink-400 h-2.5 rounded-full" style={{ width: `${(300 - timeLeft) / 3}%` }}></div>
        </div>

        {/* UP 半圆区域 */}
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

        {/* 中间价格信息块（卡通+泡泡样式） */}
        <div className="relative h-28 bg-gradient-to-br from-[#2e2e47] to-[#3c3c5a] border-[3px] border-dashed border-purple-400 rounded-lg p-4 mb-3 shadow-xl cartoon-border">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/bubble-bg.png')] bg-cover opacity-10 rounded-lg z-0" />
          <div className="relative z-10 space-y-1">
            <div className="text-sm text-white">收盘价：<span className="text-yellow-400 font-bold">{latestPrice || '加载中...'}</span></div>
            <div className="text-sm text-white">奖池总金额：<span className="text-green-400 font-bold">666</span></div>
            <div className="text-sm text-white">开盘价：<span className="text-blue-400 font-bold">{openPrice || '加载中...'}</span></div>
          </div>
        </div>

        {/* DOWN 半圆区域 */}
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

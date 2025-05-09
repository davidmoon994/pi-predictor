'use client';
import { useState, useEffect } from 'react';
import { placeBet } from "@lib/betService";
import { drawAndSettle } from "@lib/drawService";

const CurrentCard = ({ period, user }: { period: string; user: any }) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [selection, setSelection] = useState<'up' | 'down' | null>(null);
  const [userPoints, setUserPoints] = useState(user?.points || 0);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [openPrice, setOpenPrice] = useState<number | null>(null);
  const [drawTriggered, setDrawTriggered] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [isBetting, setIsBetting] = useState(false);


  const fetchKlineData = async () => {
    try {
      const res = await fetch('/api/kline');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      setLatestPrice(data.close);
      setOpenPrice(data.open);
    } catch (error) {
      console.error('Kline fetch failed:', error);
    }
  };

  useEffect(() => {
    fetchKlineData();
    const interval = setInterval(fetchKlineData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !drawTriggered && latestPrice && openPrice) {
      setDrawTriggered(true);
      drawAndSettle(period, openPrice, latestPrice);
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 10000);
    }
  }, [timeLeft, drawTriggered, latestPrice, openPrice, period]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleBet = async (direction: 'up' | 'down') => {
    if (userPoints <= 0) {
      alert("当前积分为 0，请先充值！");
      return;
    }
    const input = prompt(`当前积分：${userPoints}\n请输入买${direction === 'up' ? '涨' : '跌'}金额：`);
    const amount = Number(input);
    if (!amount || amount <= 0 || amount > userPoints) {
      alert("请输入有效金额，且不得超过当前积分");
      return;
    }

    try {
      await placeBet(user.uid, period, direction, amount, user.invitedBy);
      alert(`成功投注 ${amount} Pi（买${direction === 'up' ? '涨' : '跌'}）`);
      setUserPoints(prev => prev - amount); // 本地扣除积分
    } catch (err: any) {
      alert("投注失败：" + err.message);
    }
  };

  return (
    <div className="relative">
      {/* 彩蛋弹窗 */}
      {showEasterEgg && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-yellow-100 border-2 border-yellow-500 p-4 rounded shadow-lg text-center text-lg font-bold text-yellow-800 animate-bounce">
          🎉 开奖啦！请查看结果！🎉
        </div>
      )}

      <div className="rounded-[30px] bg-gradient-to-br from-pink-200 via-purple-100 to-yellow-100 p-5 border-[3px] border-pink-400 shadow-[0_10px_30px_rgba(255,140,255,0.4)] hover:shadow-pink-500/60 transition-shadow duration-300 text-gray-800">
        
        {/* 顶部 */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-purple-800">期号：{period}</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-yellow-700 font-bold">积分：{userPoints}</span>
            <span className="font-mono text-pink-600 bg-white/70 px-2 py-1 rounded-lg shadow">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* 进度条（最后60秒才显示） */}
        <div className="w-full bg-white/70 rounded-full h-2.5 mb-4">
          <div
            className="bg-pink-400 h-2.5 rounded-full transition-all duration-1000"
            style={{ width: `${timeLeft <= 60 ? (60 - timeLeft) * (100 / 60) : 0}%` }}
          />
        </div>

        {/* 买涨按钮 */}
        <div className="flex justify-between items-center mb-2 px-6">
          <div className="w-full h-20 bg-green-100 rounded-t-full flex items-center justify-between px-6 shadow-md">
            <span className="text-green-800 text-lg font-bold">UP</span>
            <button
              onClick={() => handleBet('up')}
              className="flex items-center space-x-1 border border-green-700 bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1 rounded-full shadow transition"
            >
              <span>↑</span><span>买涨</span>
            </button>
          </div>
        </div>

        {/* 中间价格信息 */}
        <div className="relative h-28 bg-gradient-to-br from-[#2e2e47] to-[#3c3c5a] border-[3px] border-dashed border-purple-400 rounded-lg p-4 mb-3 shadow-xl cartoon-border">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/bubble-bg.png')] bg-cover opacity-10 rounded-lg z-0" />
          <div className="relative z-10 space-y-1">
            <div className="text-sm text-white">收盘价：<span className="text-yellow-400 font-bold">{latestPrice ?? '加载中...'}</span></div>
            <div className="text-sm text-white">奖池总金额：<span className="text-green-400 font-bold">666</span></div>
            <div className="text-sm text-white">开盘价：<span className="text-blue-400 font-bold">{openPrice ?? '加载中...'}</span></div>
          </div>
        </div>

        {/* 买跌按钮 */}
        <div className="flex justify-between items-center mt-1 px-6">
          <div className="w-full h-20 bg-red-100 rounded-b-full flex items-center justify-between px-6 shadow-md">
            <span className="text-red-800 text-lg font-bold">DOWN</span>
            <button
              onClick={() => handleBet('down')}
              className="flex items-center space-x-1 border border-red-700 bg-red-400 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-full shadow transition"
            >
              <span>↓</span><span>买跌</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CurrentCard;

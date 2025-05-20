//app/components/CurrentCard.tsx
'use client';
import { useState, useEffect } from 'react';
import { placeBet } from "@lib/betService";
import { drawAndSettle } from "@lib/drawService";
import { getPoolAmount } from "@lib/poolService";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@lib/firebase";
import EasterEgg from "@/components/effects/EasterEgg";
import { useLatestPiPrice } from '@/hooks/useLatestPiPrice';

const CurrentCard = ({ period, user, onPeriodEnd}: { period: string; user: any ;onPeriodEnd: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [userPoints, setUserPoints] = useState(user?.points || 0);
  const [openPrice, setOpenPrice] = useState<number | null>(null);
  const [closePrice, setClosePrice] = useState<number | null>(null);
  const [drawTriggered, setDrawTriggered] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [poolAmount, setPoolAmount] = useState<number>(0);
  const latestPrice = useLatestPiPrice();

  // 获取开盘价
  const fetchKlineData = async () => {
    try {
      const res = await fetch('/api/kline');
      if (!res.ok) throw new Error('Failed to fetch Kline data');
      const data = await res.json();
      if (openPrice === null) setOpenPrice(data.open);
    } catch (err) {
      console.error('Kline fetch error:', err);
    }
  };

  // 获取奖池金额
  const fetchPoolAmount = async () => {
    try {
      const amount = await getPoolAmount(period);
      setPoolAmount(amount);
    } catch (err) {
      console.error("获取奖池失败", err);
    }
  };

  // 获取用户最新积分（从 Firestore）
  const fetchLatestUserPoints = async () => {
    if (!user?.uid) return;
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserPoints(data.points || 0);
      }
    } catch (err) {
      console.error("获取用户积分失败", err);
    }
  };

  // 每期初始化
  useEffect(() => {
    setTimeLeft(300);
    setDrawTriggered(false);
    setOpenPrice(null);
    setClosePrice(null);
    fetchKlineData();
    fetchPoolAmount();
    const interval = setInterval(() => {
      fetchKlineData();
      fetchPoolAmount();
    }, 60000);
    return () => clearInterval(interval);
  }, [period]);

  // 倒计时逻辑
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

  // 开奖逻辑（只触发一次）
  useEffect(() => {
    if (timeLeft === 0 && !drawTriggered && latestPrice && openPrice !== null) {
      setDrawTriggered(true);
      setClosePrice(latestPrice); // 固定收盘价
      drawAndSettle(period, openPrice, latestPrice)
        .then(() => {
          setShowEasterEgg(true);
          setTimeout(() => setShowEasterEgg(false), 10000);
          fetchLatestUserPoints(); // 更新积分
          fetchPoolAmount();
          setUserPoints(user?.points || 0);
          // 自动切换到下一期（延迟几秒避免动画冲突）
    setTimeout(() => {
      onPeriodEnd();  // ✅ 通知父组件切换期号
    }, 2000);
        })
        .catch(err => console.error("开奖失败", err));
    }
  }, [timeLeft, drawTriggered, latestPrice, openPrice, period, user]);

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
      setUserPoints(prev => prev - amount);
      fetchPoolAmount();
    } catch (err: any) {
      alert("投注失败：" + err.message);
    }
  };

  return (
    <div className="relative">
      {showEasterEgg && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-yellow-100 border-2 border-yellow-500 p-4 rounded shadow-lg text-center text-lg font-bold text-yellow-800 animate-bounce">
          🎉 开奖啦！请查看结果！🎉
        </div>
      )}

      <div className="rounded-[30px] bg-gradient-to-br from-pink-200 via-purple-100 to-yellow-100 p-5 border-[3px] border-pink-400 shadow-[0_10px_30px_rgba(255,140,255,0.4)] hover:shadow-pink-500/60 transition-shadow duration-300 text-gray-800">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-purple-800">期号：{period}</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-yellow-700 font-bold">积分：{userPoints}</span>
            <span className="font-mono text-pink-600 bg-white/70 px-2 py-1 rounded-lg shadow">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="w-full bg-white/70 rounded-full h-2.5 mb-4">
          <div
            className="bg-pink-400 h-2.5 rounded-full transition-all duration-1000"
            style={{ width: `${timeLeft <= 60 ? (60 - timeLeft) * (100 / 60) : 0}%` }}
          />
        </div>

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

        <div className="relative h-28 bg-gradient-to-br from-[#2e2e47] to-[#3c3c5a] border-[3px] border-dashed border-purple-400 rounded-lg p-4 mb-3 shadow-xl cartoon-border">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/bubble-bg.png')] bg-cover opacity-10 rounded-lg z-0" />
          <div className="relative z-10 space-y-1">
            <div className="text-sm text-white">
              收盘价：<span className="text-yellow-400 font-bold">{closePrice ?? '开奖中...'}</span>
            </div>
            <div className="text-sm text-white">
              奖池总金额：<span className="text-green-400 font-bold">{poolAmount}</span>
            </div>
            <div className="text-sm text-white">
              开盘价：<span className="text-blue-400 font-bold">{openPrice ?? '加载中...'}</span>
            </div>
          </div>
        </div>

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

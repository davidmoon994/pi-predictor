'use client';
import { useEffect, useState } from 'react';

const UpcomingCard = ({ period }: { period: string }) => {
  const [timeLeft, setTimeLeft] = useState(900); // 示例倒计时
  const [openPrice, setOpenPrice] = useState<number | null>(null);
  const [closePrice, setClosePrice] = useState<number | null>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // 客户端 fetch 获取 kline 数据
  const fetchKlineData = async () => {
    try {
      const res = await fetch('/api/kline');
      const data = await res.json();
      if (data && data.open && data.close) {
        setOpenPrice(data.open);
        setClosePrice(data.close);
      }
    } catch (error) {
      console.error('获取K线数据失败:', error);
    }
  };

  useEffect(() => {
    fetchKlineData();
    const interval = setInterval(fetchKlineData, 60000); // 每分钟刷新一次
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="relative opacity-60">
      <div className="rounded-xl bg-gradient-to-br from-[#1a1a24] to-[#2a2a3c] p-4 border border-purple-500/20 shadow-[0_0_10px_rgba(124,58,237,0.2)] text-white">

        {/* 顶部信息（隐藏） */}
        <div className="flex justify-between items-center mb-3 h-5">
          <span className="text-sm opacity-0">期号：{period}</span>
          <div className="flex items-center gap-4 opacity-0">
            <span className="text-xs text-yellow-300">积分</span>
            <span className="text-cyan-300 font-mono">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3">
          <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
        </div>

        {/* UP 区域 */}
        <div className="flex justify-between items-center mb-1 px-6">
          <div className="w-full h-20 bg-green-100 rounded-t-full flex items-center justify-center shadow-md cartoon-border-green">
            <span className="text-green-800 text-lg font-bold">UP</span>
          </div>
        </div>

        {/* 中间信息卡片 */}
        <div className="relative h-28 bg-gradient-to-br from-[#2e2e47] to-[#3c3c5a] border-[3px] border-dashed border-purple-400 rounded-lg p-4 mb-3 shadow-xl cartoon-border">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/bubble-bg.png')] bg-cover opacity-10 rounded-lg z-0" />
          <div className="relative z-10 space-y-1">
            <div className="text-sm text-white">收盘价：<span className="text-yellow-400 font-bold">{closePrice ?? '加载中...'}</span></div>
            <div className="text-sm text-white">奖池总金额：<span className="text-green-400 font-bold">666</span></div>
            <div className="text-sm text-white">开盘价：<span className="text-blue-400 font-bold">{openPrice ?? '加载中...'}</span></div>
            <span className="text-cyan-300 font-mono text-2xl">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* DOWN 区域 */}
        <div className="flex justify-between items-center mt-1 px-6">
          <div className="w-full h-20 bg-red-100 rounded-b-full flex items-center justify-center shadow-md cartoon-border-red">
            <span className="text-red-800 text-lg font-bold">DOWN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingCard;

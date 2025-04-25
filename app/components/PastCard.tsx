// app/components/PastCard.tsx
// app/components/PastCard.tsx
'use client';

const PastCard = ({ period }: { period: string }) => {
  return (
    <div className="relative opacity-60">
      <div className="rounded-xl bg-gradient-to-br from-[#1a1a24] to-[#2a2a3c] p-4 border border-purple-500/20 shadow-[0_0_10px_rgba(124,58,237,0.2)] text-white">
        
        {/* 顶部：期�?+ 积分 + 倒计时（静态） */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold">期号：{period}</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-yellow-300">积分�?00</span>
            <span className="text-cyan-300 font-mono">00:00</span>
          </div>
        </div>

        {/* 静态进度条 */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3">
          <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
        </div>

       {/* UP 区域（静态、卡通半圆） */}
       <div className="flex justify-between items-center mb-1 px-6">
          <div className="w-full h-20 bg-green-100 rounded-t-full flex items-center justify-center shadow-md cartoon-border-green">
            <span className="text-green-800 text-lg font-bold">UP</span>
          </div>
        </div>

        {/* 中间价格信息（卡通边�?+ 泡泡背景�?*/}
        <div className="h-24 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg px-4 py-2 flex flex-col justify-center shadow-inner mb-3">
          <div className="text-sm text-white">收盘价：<span className="text-yellow-400 font-bold">0.7777</span></div>
          <div className="text-sm text-white">奖池总金额：<span className="text-green-400 font-bold">888 Pi</span></div>
          <div className="text-sm text-white">开盘价�?span className="text-blue-400 font-bold">0.6666</span></div>
        </div>

        
        {/* DOWN 区域（静态、卡通半圆） */}
        <div className="flex justify-between items-center mt-1 px-6">
          <div className="w-full h-20 bg-red-100 rounded-b-full flex items-center justify-center shadow-md cartoon-border-red">
            <span className="text-red-800 text-lg font-bold">DOWN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastCard;

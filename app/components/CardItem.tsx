'use client';
import React from 'react';
import EasterEgg from './effects/EasterEgg';

interface CardItemProps {
  issueId: string;
  status: 'past' | 'live' | 'next' | 'upcoming';
  lockedPrice: number;
  lastPrice: number;
  priceChange: number;
  prizePool: number;
  upPayout: number;
  downPayout: number;
  progress?: number; // live 专用
  showEasterEgg?: boolean; // live 专用
}

export default function CardItem({
  issueId,
  status,
  lockedPrice,
  lastPrice,
  priceChange,
  prizePool,
  upPayout,
  downPayout,
  progress = 0,
  showEasterEgg = false,
}: CardItemProps) {
  return (
  <div className="w-64 bg-white rounded-2xl shadow-xl border border-gray-200 px-4 py-5 flex flex-col justify-between text-gray-800 transition-all hover:scale-105">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center text-xs font-bold mb-2">
        <div className="text-purple-600">{status === 'live' ? 'LIVE' : 'CLOSED'}</div>
        <div className="text-gray-400">#{issueId}</div>
      </div>
    {/* Top Banner */}
 <div className="absolute top-2 left-2 text-xs font-bold text-purple-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
            LIVE
          </div>
          
 {/* 进度�?(只在 live 显示) */}
      {status === 'live' && (
        <div className="h-2 w-full bg-gray-700 rounded mb-2 overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

 {/* UP 标签 */}
 <div className="bg-green-100 text-green-600 text-sm font-bold py-1 px-3 rounded-full mt-6 mb-2">
            UP 1.50x Payout
          </div>
        
{/* 价格信息�?*/}
<div className="bg-gray-100 rounded-xl border border-green-300 p-3 w-full mb-3">
            <div className="text-xs text-gray-500 mb-1">LAST PRICE</div>
            <div className="text-2xl font-bold text-green-600">$0.6526</div>
            <div className="flex justify-center items-center gap-2 text-sm mt-1">
              <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full">�?1.5%</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <div>Locked Price: <span className="font-semibold">$0.64552</span></div>
              <div>Prize Pool: <span className="font-bold text-black">5790 pi</span></div>
            </div>
          </div>

 {/* DOWN 标签 */}
 <div className="bg-red-100 text-red-600 text-sm font-bold py-1 px-3 rounded-full mt-auto">
            3.02x Payout DOWN
          </div>
          
      {/* 奖池�?*/}
      <div className="text-xs text-center text-yellow-300 mb-1">
        奖池：{prizePool} Pi
      </div>

      {/* 彩蛋动画（仅 live 显示�?*/}
      {status === 'live' && showEasterEgg && (
        <div className="absolute top-0 left-0 w-full h-full z-50 pointer-events-none">
          <EasterEgg />
        </div>
      )}
    </div>
  );
}

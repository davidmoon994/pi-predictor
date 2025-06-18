// app/components/ui/CardWrapper.tsx
'use client';

import React from 'react';
import { clsx } from 'clsx';
import { getDisplayPeriodNumber } from '@lib/utils/period';

export type CardVariant = 'past' | 'current' | 'next' | 'upcoming';

interface CardWrapperProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  past: 'bg-gray-100 border-gray-300',
  current: 'bg-gradient-to-br from-pink-200 via-purple-100 to-yellow-100 border-pink-400',
  next: 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-300',
  upcoming: 'bg-gradient-to-br from-yellow-100 to-pink-100 border-yellow-300',
};

const CardWrapper: React.FC<CardWrapperProps> & {
  Header: typeof Header;
  Content: typeof Content;
  Up: typeof Up;
  Down: typeof Down;
} = ({ variant = 'current', children, className }) => {
  return (
    <div
      className={clsx(
        'rounded-[30px] p-5 border-[3px] shadow-lg transition-shadow duration-300 text-gray-800 relative',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

const Header: React.FC<{
  period: number;
  time?: string;
  countdown?: string;
  progress?: number;
}> = ({ period, time, countdown, progress = 1 }) => {
  const showLocked = progress <= 60 / 300;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center text-sm text-purple-800 font-bold mb-2">
        <span>第 {getDisplayPeriodNumber(period)} 期</span>
        <div className="flex items-center gap-3 text-xs text-gray-700 font-normal">
          {countdown && (
            <span className="font-mono text-pink-600 bg-white/70 px-2 py-1 rounded-lg shadow">
              {countdown}
            </span>
          )}
        </div>
      </div>
      <div className="relative w-full h-2 rounded-full bg-gray-300 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-1000"
          style={{ width: `${100 - progress * 100}%` }}
        />
      </div>
      {showLocked && (
        <div className="text-xs text-red-500 mt-1 font-semibold text-right">锁盘中...</div>
      )}
    </div>
  );
};

const Content: React.FC<{
  open: string | null;
  close: string | null;
  pool?: number;
  ratio?: string;
  isPastCard?: boolean;
}> = ({ open, close, pool, ratio, isPastCard }) => {
  const risePercent =
    open && close
      ? (((parseFloat(close) - parseFloat(open)) / parseFloat(open)) * 100).toFixed(2)
      : null;
  const isUp = open && close ? parseFloat(close) > parseFloat(open) : false;

  return (
    <div className="relative min-h-[140px] bg-gradient-to-br from-[#2e2e47] to-[#3c3c5a] border-[3px] border-dashed border-purple-400 rounded-lg p-4 mb-3 shadow-xl">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/bubble-bg.png')] bg-cover opacity-10 rounded-lg z-0" />
      <div className="relative z-10 space-y-1 text-sm text-white">
        {isPastCard ? (
          <>
            <div>开盘价：<span className="text-blue-400 font-bold">{open ?? '—'}</span></div>
            <div>收盘价：<span className="text-yellow-400 font-bold">{close ?? '—'}</span></div>
            <div>
              涨跌幅：
              <span className={clsx('font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
                {risePercent ? `${isUp ? '+' : ''}${risePercent}%` : '--'}
              </span>
            </div>
            <div>奖池总金额：<span className="text-green-400 font-bold">{pool?.toLocaleString() ?? '—'}</span></div>
            <div>投注分布：<span className="text-pink-400 font-bold">{ratio ?? '—'}</span></div>
          </>
        ) : (
          <>
            <div>收盘价：<span className="text-yellow-400 font-bold">{close ?? '—'}</span></div>
            <div>奖池总金额：<span className="text-green-400 font-bold">{pool ?? '—'}</span></div>
            <div>开盘价：<span className="text-blue-400 font-bold">{open ?? '—'}</span></div>
          </>
        )}
      </div>
    </div>
  );
};

const Up: React.FC<{ onClick?: () => void; disabled?: boolean; className?: string }> = ({ onClick, disabled, className }) => (
  <div className={clsx("flex items-center justify-between bg-green-100 px-4 py-3 rounded-xl shadow mb-2", className)}>
    <span className="text-green-800 text-lg font-bold"></span>
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex items-center space-x-1 border border-green-700 bg-green-500 text-white font-bold px-3 py-1 rounded-full shadow transition',
        {
          'opacity-50 cursor-not-allowed': disabled,
          'hover:bg-green-600': !disabled,
        }
      )}
    >
      <span>↑</span>
      <span>买涨</span>
    </button>
  </div>
);

const Down: React.FC<{ onClick?: () => void; disabled?: boolean; className?: string }> = ({ onClick, disabled, className }) => (
  <div className={clsx("bg-red-100 border border-red-400 rounded-xl px-4 py-3 shadow-sm flex justify-between items-center", className)}>
    <span className="text-red-800 font-semibold"></span>
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'bg-red-500 text-white font-bold px-4 py-1.5 rounded-full shadow transition',
        {
          'opacity-50 cursor-not-allowed': disabled,
          'hover:bg-red-600': !disabled,
        }
      )}
    >
      买跌 ↓
    </button>
  </div>
);

CardWrapper.Header = Header;
CardWrapper.Content = Content;
CardWrapper.Up = Up;
CardWrapper.Down = Down;

export default CardWrapper;

// app/components/CurrentCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import CardWrapper from './ui/CardWrapper';
import EasterEgg from './effects/EasterEgg';
import BetModal from './modals/BetModal';
import WithdrawModal from '../userCenter/components/WithdrawModal';

import { useKlineStore } from '../../lib/store/klineStore';
import { useUserStore } from '../../lib/store/useStore';

import { fetchPoolAmount } from '../../lib/poolService';
import { placeBet } from '../../lib/betService';

interface CurrentCardProps {
  timeLeft: number;
  onBet: (type: 'up' | 'down', amount: number) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const CurrentCard: React.FC<CurrentCardProps> = ({ timeLeft, onBet }) => {
  const { open, close, readableTime, periodNumber } = useKlineStore();
  const { user } = useUserStore();

  const [countdown, setCountdown] = useState(timeLeft);
  const [locked, setLocked] = useState(false);
  const [showEgg, setShowEgg] = useState(false); // ✅ 可保留动画控制
  const [progress, setProgress] = useState(0);
  const [poolAmount, setPoolAmount] = useState(0);

  const [betType, setBetType] = useState<'up' | 'down' | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // ✅ 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ 每期更新奖池金额
  useEffect(() => {
    const valid = typeof periodNumber === 'number' && !isNaN(periodNumber);
    if (valid) {
      fetchPoolAmount(String(periodNumber)).then(setPoolAmount);
    }
  }, [periodNumber]);
  
  // ✅ 锁定下注时间（最后60秒）
  useEffect(() => {
    if (countdown <= 60 && !locked) {
      setLocked(true);
    }
  }, [countdown, locked]);

  // ✅ 保留进度条动画（不触发 drawAndSettle）
  useEffect(() => {
    if (locked && countdown > 0) {
      setProgress(((60 - countdown) / 60) * 100);
    }
    if (countdown === 0) {
      setProgress(100);
      setShowEgg(true);

      // ❌ 已移除结算逻辑，结算现在由 CardSlider 控制
      setTimeout(() => {
        setShowEgg(false);
      }, 10000); // 动画播放完收起
    }
  }, [countdown, locked]);

  // ✅ 点击下注按钮
  const handleBetClick = (type: 'up' | 'down') => {
    if (!user || user.points < 100) {
      setShowWithdraw(true);
      return;
    }
    setBetType(type);
    setShowBetModal(true);
  };

  // ✅ 确认下注
  const handleConfirmBet = async (amount: number) => {
    if (!betType || !user) return;

    try {
      await placeBet(
        user.uid,
        String(periodNumber),
        betType,
        amount,
        user.invitedBy || undefined
      );
      onBet(betType, amount);
    } catch (err) {
      console.error('下注失败 ❌', err);
    } finally {
      setShowBetModal(false);
      setBetType(null);
    }
  };

  if (!open || !close || !readableTime || !periodNumber) return <div>加载中...</div>;

  return (
    <CardWrapper variant="current">
      <CardWrapper.Header
        period={periodNumber}
        countdown={formatTime(countdown)}
        progress={locked ? progress : undefined}
      />

      <CardWrapper.Up onClick={() => handleBetClick('up')} disabled={locked} />
      <CardWrapper.Content
  open={open?.toString() ?? null}
  close={close?.toString() ?? null}
  pool={poolAmount}
/>

      <CardWrapper.Down onClick={() => handleBetClick('down')} disabled={locked} />

      {/* 下注弹窗 */}
      {showBetModal && betType && (
        <BetModal
          type={betType}
          onClose={() => setShowBetModal(false)}
          onConfirm={handleConfirmBet}
        />
      )}

      {/* 充值弹窗 */}
      {showWithdraw && (
  <WithdrawModal
    isOpen={showWithdraw}
    userId={user?.uid ?? ''}   // 这里用当前用户id，注意处理user为空的情况
    onClose={() => setShowWithdraw(false)}
  />
)}

      {/* 开奖动画 */}
      {showEgg && <EasterEgg />}
    </CardWrapper>
  );
};

export default CurrentCard;

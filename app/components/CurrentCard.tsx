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
import { useKlineData } from '@/hooks/useKlineData';

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
  useKlineData(); // ✅ 每分钟拉取最新数据

  const open = useKlineStore((s) => s.latest?.open);
  const close = useKlineStore((s) => s.latest?.close);
  const readableTime = useKlineStore((s) => s.latest?.readableTime);
  const periodNumber = useKlineStore((s) => s.latest?.periodNumber);

  const { user } = useUserStore();

  const [countdown, setCountdown] = useState(timeLeft);
  const [locked, setLocked] = useState(false);
  const [showEgg, setShowEgg] = useState(false);
  const [progress, setProgress] = useState(0);
  const [poolAmount, setPoolAmount] = useState(0);

  const [betType, setBetType] = useState<'up' | 'down' | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // ✅ 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

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

  // ✅ 播放开奖动画
  useEffect(() => {
    if (locked && countdown > 0) {
      setProgress(((60 - countdown) / 60) * 100);
    }
    if (countdown === 0) {
      setProgress(100);
      setShowEgg(true);

      // ❌ 结算逻辑由 CardSlider 控制
      setTimeout(() => {
        setShowEgg(false);
      }, 10000); // 播放完动画再关闭
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

  if (!open || !close || !readableTime || !periodNumber) {
    return <div>加载中...</div>;
  }

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
          userId={user?.uid ?? ''}
          onClose={() => setShowWithdraw(false)}
        />
      )}

      {/* 开奖彩蛋动画 */}
      {showEgg && <EasterEgg />}
    </CardWrapper>
  );
};

export default CurrentCard;

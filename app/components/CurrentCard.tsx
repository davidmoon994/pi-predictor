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
  useKlineData();

  const open = useKlineStore((s) => s.latest?.open);
  const close = useKlineStore((s) => s.latest?.close);
  const readableTime = useKlineStore((s) => s.latest?.readableTime);
  const periodNumber = useKlineStore((s) => s.latest?.periodNumber);
  const { user } = useUserStore();

  const [locked, setLocked] = useState(false);
  const [showEgg, setShowEgg] = useState(false);
  const [progress, setProgress] = useState(0);
  const [poolAmount, setPoolAmount] = useState(0);
  const [betType, setBetType] = useState<'up' | 'down' | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    const valid = typeof periodNumber === 'number' && !isNaN(periodNumber);
    if (valid) {
      fetchPoolAmount(String(periodNumber)).then(setPoolAmount);
    }
  }, [periodNumber]);

  useEffect(() => {
    setLocked(timeLeft <= 60);
    setProgress(timeLeft <= 60 ? ((60 - timeLeft) / 60) * 100 : 0);
    if (timeLeft === 0) {
      setShowEgg(true);
      setTimeout(() => setShowEgg(false), 10000);
    }
  }, [timeLeft]);

  const handleBetClick = (type: 'up' | 'down') => {
    if (!user || user.points < 100) {
      setShowWithdraw(true);
      return;
    }
    setBetType(type);
    setShowBetModal(true);
  };

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
        countdown={formatTime(timeLeft)}
        progress={locked ? progress : undefined}
      />

      <CardWrapper.Up onClick={() => handleBetClick('up')} disabled={locked} />

      <CardWrapper.Content
        open={open.toString()}
        close={close.toString()}
        pool={poolAmount}
      />

      <CardWrapper.Down onClick={() => handleBetClick('down')} disabled={locked} />

      {showBetModal && betType && (
        <BetModal
          type={betType}
          onClose={() => setShowBetModal(false)}
          onConfirm={handleConfirmBet}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          isOpen={showWithdraw}
          userId={user?.uid ?? ''}
          onClose={() => setShowWithdraw(false)}
        />
      )}

      {showEgg && <EasterEgg />}
    </CardWrapper>
  );
};

export default CurrentCard;

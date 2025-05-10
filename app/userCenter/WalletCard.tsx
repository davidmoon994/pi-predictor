//app/userCenter/WalletCard.tsx
'use client';

import React, { useState } from 'react';
import RechargeModal from '@/components/RechargeModal';
import WithdrawModal from '@/components/WithdrawModal';

interface WalletCardProps {
  userId: string;
  points: number;
}

const WalletCard: React.FC<WalletCardProps> = ({ userId, points }) => {
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <div className="postcard">
      <div className="card-header">
        <h3>我的钱包</h3>
      </div>
      <div className="card-body">
        <p><strong>用户ID：</strong> {userId}</p>
        <p><strong>当前积分：</strong> {points}</p>
        <div style={{ marginTop: '20px' }}>
          <button className="btn-recharge" onClick={() => setShowRecharge(true)}>充值</button>
          <button className="btn-withdraw" onClick={() => setShowWithdraw(true)}>提现</button>
        </div>
      </div>

      {/* 弹窗组件 */}
      <RechargeModal
        userId={userId}
        isOpen={showRecharge}
        onClose={() => setShowRecharge(false)}
      />
      <WithdrawModal
        userId={userId}
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
      />
    </div>
  );
};

export default WalletCard;

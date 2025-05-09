'use client';

import React, { useState } from 'react';

interface WalletCardProps {
  userId: string;
  points: number;
  onRechargeClick: () => void;
  onWithdrawClick: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  userId,
  points,
  onRechargeClick,
  onWithdrawClick,
}) => {
  return (
    <div className="postcard">
      <div className="card-header">
        <h3>我的钱包</h3>
      </div>
      <div className="card-body">
        <p><strong>用户ID：</strong> {userId}</p>
        <p><strong>当前积分：</strong> {points}</p>
        <div style={{ marginTop: '20px' }}>
          <button className="btn-recharge" onClick={onRechargeClick}>充值</button>
          <button className="btn-withdraw" onClick={onWithdrawClick}>提现</button>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;

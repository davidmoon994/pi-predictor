//app/userCenter/CommissionCard.tsx
'use client';

import React from 'react';

type Commission = {
  id: string;
  userId: string;
  sourceUserId: string;
  fromUserName?: string;
  amount: number;
  type: 'level1' | 'level2';
  timestamp: number;
};

interface CommissionsCardProps {
  commissions?: Commission[]; // 改为可选，并设置默认值
}

const CommissionsCard: React.FC<CommissionsCardProps> = ({ commissions = [] }) => {
  const totalCommission = commissions.reduce((sum, record) => sum + (record.amount || 0), 0);

  return (
    <div className="postcard">
      <div className="card-header">
        <h3>分润提成（赚 Pi 日志）</h3>
      </div>
      <div className="card-body">
        <p><strong>总分润：</strong> {totalCommission.toFixed(2)} Pi</p>
        <ul className="commission-list">
          {commissions.length === 0 ? (
            <p>暂无分润记录</p>
          ) : (
            commissions.map((commission, index) => (
              <li key={index}>
                <p>
                  <strong>来源：</strong> {commission.fromUserName || '未知用户'}<br />
                  <strong>类型：</strong> {commission.type === 'level1' ? '一级' : '二级'}<br />
                  <strong>金额：</strong> {commission.amount.toFixed(2)} Pi<br />
                  <strong>时间：</strong> {new Date(commission.timestamp).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommissionsCard;

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

type Props = {
  commissions: Commission[];
};

const CommissionsCard: React.FC<Props> = ({ commissions = [] }) => {
  const totalCommission = commissions.reduce(
    (sum, record) => sum + (record.amount || 0),
    0
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">分润提成（赚 Pi 日志）</h2>

      <p className="mb-4">
        <strong>总分润：</strong> {totalCommission.toFixed(2)} Pi
      </p>

      {commissions.length === 0 ? (
        <p className="text-gray-400">暂无分润记录</p>
      ) : (
        <ul className="space-y-4">
          {commissions.map((commission) => (
            <li key={commission.id} className="bg-gray-700 p-4 rounded">
              <p className="text-sm">
                <strong>来源：</strong> {commission.fromUserName || '未知用户'}
              </p>
              <p className="text-sm">
                <strong>类型：</strong> {commission.type === 'level1' ? '一级' : '二级'}
              </p>
              <p className="text-sm">
                <strong>金额：</strong> {commission.amount.toFixed(2)} Pi
              </p>
              <p className="text-sm">
                <strong>时间：</strong>{' '}
                {new Date(commission.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommissionsCard;

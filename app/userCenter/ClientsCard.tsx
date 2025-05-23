//app/userCenter/ClientsCard.tsx
'use client';

import React from 'react';
import { UserData } from '@lib/types';

type Props = {
  referrals: UserData[];
  secondLevelUsers: UserData[];
};

const ClientsCard: React.FC<Props> = ({ referrals, secondLevelUsers }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">客户信息</h2>

      <div className="mb-4">
        <p className="text-lg font-semibold">一级客户</p>
        {referrals.length > 0 ? (
          <ul className="space-y-2">
            {referrals.map((ref) => (
              <li key={ref.uid} className="bg-gray-700 p-4 rounded">
                <p className="text-sm">用户名: {ref.displayName || '未设置'}</p>
                <p className="text-sm">账户ID: {ref.uid}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">暂无一级客户</p>
        )}
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold">二级客户</p>
        {secondLevelUsers.length > 0 ? (
          <ul className="space-y-2">
            {secondLevelUsers.map((ref) => (
              <li key={ref.uid} className="bg-gray-700 p-4 rounded">
                <p className="text-sm">用户名: {ref.displayName || '未设置'}</p>
                <p className="text-sm">账户ID: {ref.uid}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">暂无二级客户</p>
        )}
      </div>
    </div>
  );
};

export default ClientsCard;

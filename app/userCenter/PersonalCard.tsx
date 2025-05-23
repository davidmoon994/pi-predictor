//app/userCenter/PersonalCard.tsx
'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { auth, db } from '@lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserData, Commission } from '@lib/types';

type Props = {
  userData: UserData;
  referrals: UserData[];
  secondLevelUsers: UserData[];
  commissions?: Commission[];
};
const PersonalCard: React.FC<Props> = ({ userData, referrals, secondLevelUsers, commissions }) => {
  if (!userData) return <div>无用户数据</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">个人账户信息</h2>

      <div className="flex items-center mb-4">
        <img
          src={userData.avatarUrl || '/default-avatar.png'}
          alt="用户头像"
          className="w-16 h-16 rounded-full mr-4"
        />
        <div>
          <p className="text-lg font-bold">{userData.displayName}</p>
          <p className="text-sm text-gray-400">账户 ID: {userData.uid}</p>
        </div>
      </div>

      <div className="mb-4">
        <p>当前积分：<span className="text-yellow-400 font-bold">{userData.points}</span></p>
      </div>

      <div className="mb-4">
        <p>一级客户：<span className="text-green-400">{referrals.length}</span></p>
        <p>二级客户：<span className="text-green-400">{secondLevelUsers.length}</span></p>
      </div>

      <div className="mb-4">
      <p>
  本月利润总额：
  <span className="text-yellow-400 font-bold">
    {(commissions ?? []).reduce((sum, c) => sum + c.amount, 0)} PI
  </span>
</p>

      </div>
    </div>
  );
};

export default PersonalCard;

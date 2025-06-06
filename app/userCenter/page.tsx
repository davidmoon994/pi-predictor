//app/userCenter/page.tsx
'use client';

import { useState } from 'react';
import UserCenterClient from './UserCenterClient';
import PersonalCard from './PersonalCard';
import ClientsCard from './ClientsCard';
import CommissionsCard from './CommissionCard';
import InviteCard from './InviteCard';
import WalletCard from './WalletCard';
import BetsCard from './BetsCard';
import { UserData, BetRecord } from '../../lib/types';
import './userCenter.css';

type Commission = {
  id: string;
  userId: string;
  sourceUserId: string;
  fromUserName?: string;
  amount: number;
  type: 'level1' | 'level2';
  timestamp: number;
};

export default function UserCenterPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [referrals, setReferrals] = useState<UserData[]>([]);
  const [secondLevelUsers, setSecondLevelUsers] = useState<UserData[]>([]);
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]); // ✅ 添加

  const handleDataLoad = (data: {
    userData: UserData;
    referrals: UserData[];
    secondLevelUsers: UserData[];
    bets: BetRecord[];
    commissions: Commission[]; // ✅ 添加
  }) => {
    setUserData(data.userData);
    setReferrals(data.referrals);
    setSecondLevelUsers(data.secondLevelUsers);
    setBets(data.bets);
    setCommissions(data.commissions); // ✅ 添加
  };

  const isReady = userData !== null;

  return (
    <>
      <UserCenterClient onData={handleDataLoad} />
      <div className="user-center">
        {isReady ? (
          <div className="content grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="postcard">
              <PersonalCard
                userData={userData}
                referrals={referrals}
                secondLevelUsers={secondLevelUsers}
                commissions={commissions} // ✅ 添加
              />
            </div>
            <div className="postcard">
              <ClientsCard referrals={referrals} secondLevelUsers={secondLevelUsers} />
            </div>
            <div className="postcard">
              <CommissionsCard commissions={commissions} />
            </div>
            <div className="postcard">
            <InviteCard />
            </div>
            <div className="postcard">
              <WalletCard userId={userData.uid} points={userData.points ?? 0} />
            </div>
            <div className="postcard">
              <BetsCard bets={bets} />
            </div>
          </div>
        ) : (
          <div className="text-white p-6">加载中...</div>
        )}
      </div>
    </>
  );
}

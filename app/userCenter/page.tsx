// app/userCenter/page.tsx
'use client';

import React from 'react';
import { UserData, CommissionData, BetRecord } from '@lib/authService';
import PersonalCard from './PersonalCard';
import ClientsCard from './ClientsCard';
import CommissionsCard from './CommissionCard';
import InviteCard from './InviteCard';
import WalletCard from './WalletCard';
import BetsCard from './BetsCard';
import './userCenter.css';

interface Props {
  userData: UserData;
  referrals: UserData[];
  secondLevelUsers: UserData[];
  commissions: CommissionData[];
  bets: BetRecord[];
}

const UserCenterPage: React.FC<Props> = ({
  userData,
  referrals,
  secondLevelUsers,
  commissions,
  bets,
}) => {
  return (
    <div className="user-center">
      <div className="content grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="postcard">
          <PersonalCard userData={userData} referrals={referrals} secondLevelUsers={secondLevelUsers} commissions={commissions} />
        </div>
        <div className="postcard">
          <ClientsCard referrals={referrals} secondLevelUsers={secondLevelUsers} />
        </div>
        <div className="postcard">
          <CommissionsCard commissions={commissions} />
        </div>
        <div className="postcard">
          <InviteCard userData={userData} />
        </div>
        <div className="postcard">
          <WalletCard userData={userData} />
        </div>
        <div className="postcard">
          <BetsCard bets={bets} />
        </div>
      </div>
    </div>
  );
};

export default UserCenterPage;

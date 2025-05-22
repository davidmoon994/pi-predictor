//app/userCenter/BetsCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@lib/firebase';
import { BetRecord } from '@lib/authService';
import { collection, getDocs, query, where } from 'firebase/firestore';

type Props = {
  bets: BetRecord[];
};

type BetsCardProps = {
  bets: BetRecord[];
};


const BetsCard: React.FC<BetsCardProps> = ({ bets }) => {
  const [betRecords, setBetRecords] = useState<BetRecord[]>([]);
  const [totalYearProfit, setTotalYearProfit] = useState(0);
  const [totalMonthProfit, setTotalMonthProfit] = useState(0);
  const [totalDayProfit, setTotalDayProfit] = useState(0);

  useEffect(() => {
    const fetchBetRecords = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, 'bets'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const records: BetRecord[] = snapshot.docs.map(doc => doc.data() as BetRecord);
        
        setBetRecords(records);
        calculateProfit(records);
      } catch (err) {
        console.error('获取投注记录失败:', err);
      }
    };

    const calculateProfit = (bets: BetRecord[]) => {
      const now = new Date();
      let year = 0, month = 0, day = 0;

      bets.forEach(bet => {
        if (typeof bet.profit === 'number') {
          const date = new Date(bet.timestamp);
          if (date.getFullYear() === now.getFullYear()) year += bet.profit;
          if (date.getMonth() === now.getMonth()) month += bet.profit;
          if (date.getDate() === now.getDate()) day += bet.profit;
        }
      });
      
      setTotalYearProfit(year);
      setTotalMonthProfit(month);
      setTotalDayProfit(day);
    };

    fetchBetRecords();
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">我的投注记录</h2>

      <div className="mb-2">
        <p><strong>年总利润：</strong> <span className="text-yellow-400">{totalYearProfit.toFixed(2)} Pi</span></p>
      </div>
      <div className="mb-2">
        <p><strong>月总利润：</strong> <span className="text-yellow-400">{totalMonthProfit.toFixed(2)} Pi</span></p>
      </div>
      <div className="mb-4">
        <p><strong>日总利润：</strong> <span className="text-yellow-400">{totalDayProfit.toFixed(2)} Pi</span></p>
      </div>

      <h3 className="text-lg font-semibold mb-2">投注明细</h3>
      {betRecords.length === 0 ? (
        <p className="text-gray-400">暂无投注记录</p>
      ) : (
        <ul className="space-y-3">
          {betRecords.map((bet, idx) => (
            <li key={idx} className="bg-gray-700 p-4 rounded">
              <div className="flex justify-between">
                <p className="font-semibold">
                  {bet.selection === 'up' ? '买涨' : '买跌'}
                </p>
                <p className={`font-semibold ${ (bet.profit ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
  {(bet.profit ?? 0) >= 0 ? `+${bet.profit ?? 0}` : bet.profit ?? 0} Pi
</p>

              </div>
              <p className="text-sm">投注金额：{bet.amount} Pi</p>
              <p className="text-sm">时间：{new Date(bet.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BetsCard;

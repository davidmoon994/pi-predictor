'use client';

import { useEffect, useState } from 'react';
import { db } from '@lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const BetRecordCard = () => {
  const [betRecords, setBetRecords] = useState<any[]>([]);
  const [totalYearProfit, setTotalYearProfit] = useState<number>(0);
  const [totalMonthProfit, setTotalMonthProfit] = useState<number>(0);
  const [totalDayProfit, setTotalDayProfit] = useState<number>(0);

  const calculateProfit = (bets: any[]) => {
    const now = new Date();
    let yearProfit = 0;
    let monthProfit = 0;
    let dayProfit = 0;

    bets.forEach((bet) => {
      const betDate = new Date(bet.timestamp);
      const betProfit = bet.profit;

      if (betDate.getFullYear() === now.getFullYear()) yearProfit += betProfit;
      if (betDate.getMonth() === now.getMonth()) monthProfit += betProfit;
      if (betDate.getDate() === now.getDate()) dayProfit += betProfit;
    });

    setTotalYearProfit(yearProfit);
    setTotalMonthProfit(monthProfit);
    setTotalDayProfit(dayProfit);
  };

  useEffect(() => {
    const fetchBetRecords = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("请先登录");
          return;
        }

        const betQuery = query(collection(db, 'bets'), where('userId', '==', user.uid));
        const betSnapshot = await getDocs(betQuery);
        const betList = betSnapshot.docs.map(doc => doc.data());
        
        setBetRecords(betList);
        calculateProfit(betList);
      } catch (error) {
        console.error("获取投注记录失败:", error);
      }
    };

    fetchBetRecords();
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">我的投注记录</h2>

      <div className="mb-4">
        <p className="text-lg font-semibold">年总利润：<span className="text-yellow-400">{totalYearProfit} PI</span></p>
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold">月总利润：<span className="text-yellow-400">{totalMonthProfit} PI</span></p>
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold">日总利润：<span className="text-yellow-400">{totalDayProfit} PI</span></p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">投注记录</h3>
        {betRecords.length > 0 ? (
          <ul className="space-y-2">
            {betRecords.map((bet, idx) => (
              <li key={idx} className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between">
                  <p className="font-semibold">{bet.selection === 'up' ? '买涨' : '买跌'}</p>
                  <p className="text-green-400">{bet.profit > 0 ? `+${bet.profit}` : bet.profit} PI</p>
                </div>
                <p>投注金额：{bet.amount} PI</p>
                <p>时间：{new Date(bet.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">暂无投注记录</p>
        )}
      </div>
    </div>
  );
};

export default BetRecordCard;

'use client';

import { useEffect, useState } from 'react';
import { db } from '@lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const ReferralBonusCard = () => {
  const [firstLevelCommissions, setFirstLevelCommissions] = useState<any[]>([]);
  const [secondLevelCommissions, setSecondLevelCommissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchCommissionData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("请先登录");
          return;
        }

        // 获取一级分润记录
        const firstLevelCommissionQuery = query(collection(db, 'commissions'), where('userId', '==', user.uid), where('level', '==', 1));
        const firstLevelSnapshot = await getDocs(firstLevelCommissionQuery);
        const firstLevelCommissionsData = firstLevelSnapshot.docs.map(doc => doc.data());
        setFirstLevelCommissions(firstLevelCommissionsData);

        // 获取二级分润记录
        const secondLevelCommissionQuery = query(collection(db, 'commissions'), where('userId', '==', user.uid), where('level', '==', 2));
        const secondLevelSnapshot = await getDocs(secondLevelCommissionQuery);
        const secondLevelCommissionsData = secondLevelSnapshot.docs.map(doc => doc.data());
        setSecondLevelCommissions(secondLevelCommissionsData);

      } catch (error) {
        console.error("获取分润数据失败:", error);
      }
    };

    fetchCommissionData();
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">分润提成</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">一级客户分润</h3>
        {firstLevelCommissions.length > 0 ? (
          <ul className="space-y-2">
            {firstLevelCommissions.map((commission, idx) => (
              <li key={idx} className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between">
                  <p>{commission.clientName}</p>
                  <p className="text-yellow-400">{commission.amount} PI</p>
                </div>
                <p>投注金额：{commission.betAmount} PI</p>
                <p>日期：{commission.date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">暂无一级客户分润记录</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold">二级客户分润</h3>
        {secondLevelCommissions.length > 0 ? (
          <ul className="space-y-2">
            {secondLevelCommissions.map((commission, idx) => (
              <li key={idx} className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between">
                  <p>{commission.clientName}</p>
                  <p className="text-yellow-400">{commission.amount} PI</p>
                </div>
                <p>投注金额：{commission.betAmount} PI</p>
                <p>日期：{commission.date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">暂无二级客户分润记录</p>
        )}
      </div>
    </div>
  );
};

export default ReferralBonusCard;

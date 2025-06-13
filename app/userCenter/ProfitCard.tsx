'use client';
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { auth, db } from '@lib/firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';

const ProfitCard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [firstLevelProfits, setFirstLevelProfits] = useState<any[]>([]);
  const [secondLevelProfits, setSecondLevelProfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        alert("请先登录");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        setUserData(userInfo);

        // 获取一级分润记录
        const firstLevelQuery = query(collection(db, "commissions"), where("userId", "==", user.uid), where("level", "==", 1));
        const firstLevelSnap = await getDocs(firstLevelQuery);
        setFirstLevelProfits(firstLevelSnap.docs.map((doc) => doc.data()));

        // 获取二级分润记录
        const secondLevelQuery = query(collection(db, "commissions"), where("userId", "==", user.uid), where("level", "==", 2));
        const secondLevelSnap = await getDocs(secondLevelQuery);
        setSecondLevelProfits(secondLevelSnap.docs.map((doc) => doc.data()));
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white p-6">加载中...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">分润提成</h2>

      {userData ? (
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold">一级分润记录</p>
            {firstLevelProfits.length > 0 ? (
              <ul className="space-y-2">
                {firstLevelProfits.map((profit, idx) => (
                  <li key={idx} className="bg-gray-700 p-4 rounded">
                    <p className="text-sm">类型: {profit.type}</p>
                    <p className="text-sm">金额: {profit.amount} PI</p>
                    <p className="text-sm">时间: {new Date(profit.timestamp.seconds * 1000).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无一级分润记录</p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-lg font-semibold">二级分润记录</p>
            {secondLevelProfits.length > 0 ? (
              <ul className="space-y-2">
                {secondLevelProfits.map((profit, idx) => (
                  <li key={idx} className="bg-gray-700 p-4 rounded">
                    <p className="text-sm">类型: {profit.type}</p>
                    <p className="text-sm">金额: {profit.amount} PI</p>
                    <p className="text-sm">时间: {new Date(profit.timestamp.seconds * 1000).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无二级分润记录</p>
            )}
          </div>
        </div>
      ) : (
        <p>无法获取用户信息</p>
      )}
    </div>
  );
};

export default ProfitCard;

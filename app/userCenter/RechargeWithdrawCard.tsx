'use client';

import { useState } from 'react';
import { auth, db } from '@lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const RechargeWithdrawCard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number>(0);

  const handleRecharge = async () => {
    if (amount <= 0) return alert("充值金额必须大于0");

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("请先登录");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        await updateDoc(userRef, {
          points: userInfo.points + amount,
        });

        alert("充值成功");
        setUserData((prev) => ({ ...prev, points: prev.points + amount }));
        setAmount(0);
      }
    } catch (error) {
      console.error("充值失败:", error);
      alert("充值失败，请稍后重试");
    }
  };

  const handleWithdraw = async () => {
    if (amount <= 0 || amount > userData?.points) return alert("提现金额无效");

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("请先登录");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        await updateDoc(userRef, {
          points: userInfo.points - amount,
        });

        alert("提现成功");
        setUserData((prev) => ({ ...prev, points: prev.points - amount }));
        setAmount(0);
      }
    } catch (error) {
      console.error("提现失败:", error);
      alert("提现失败，请稍后重试");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">充值与提现</h2>

      {userData ? (
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold">当前积分：</p>
            <div className="bg-gray-700 p-3 rounded text-yellow-400 text-lg">{userData.points}</div>
          </div>

          <div className="mb-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-gray-700 p-2 rounded text-white w-full"
              placeholder="请输入金额"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleRecharge}
              className="bg-green-500 p-2 rounded text-white w-1/2"
            >
              充值
            </button>
            <button
              onClick={handleWithdraw}
              className="bg-red-500 p-2 rounded text-white w-1/2"
            >
              提现
            </button>
          </div>
        </div>
      ) : (
        <p>无法获取用户信息</p>
      )}
    </div>
  );
};

export default RechargeWithdrawCard;

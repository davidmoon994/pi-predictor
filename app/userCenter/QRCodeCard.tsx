'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'qrcode.react';

const QRCodeCard = () => {
  const [userData, setUserData] = useState<any>(null);
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
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white p-6">加载中...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">我的二维码与邀请链接</h2>

      {userData ? (
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold">邀请码：</p>
            <div className="bg-gray-700 p-3 rounded text-green-400 text-lg">{userData.inviteCode}</div>
          </div>

          <div className="mb-4">
            <p className="text-lg font-semibold">邀请链接：</p>
            <div className="bg-gray-700 p-3 rounded text-blue-400">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/register?inviterId=${userData.inviteCode}`}
                className="bg-transparent text-white w-full"
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-lg font-semibold">我的二维码：</p>
            <div className="bg-gray-700 p-4 rounded text-center">
              <QRCode value={`${window.location.origin}/register?inviterId=${userData.inviteCode}`} size={256} />
            </div>
          </div>
        </div>
      ) : (
        <p>无法获取用户信息</p>
      )}
    </div>
  );
};

export default QRCodeCard;

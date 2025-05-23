// app/userCenter/InviteCard.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { UserData } from '@lib/types';
import { auth, db } from '@lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface Props {
  userData?: UserData;
}

const InviteCard: React.FC<Props> = ({ userData }) => {
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchInviteCode = async () => {
      if (userData?.inviteCode) {
        setInviteCode(userData.inviteCode);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setInviteCode(data.inviteCode);
          }
        }
      });

      return () => unsubscribe();
    };

    fetchInviteCode();
  }, [userData]);

  const inviteUrl = inviteCode
    ? `https://yourdomain.com/register?ref=${inviteCode}`
    : '';

  const qrCodeUrl = inviteCode
    ? `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(
        inviteUrl
      )}&chs=200x200&chld=L|0`
    : '';

  return (
    <div className="postcard">
      <div className="card-header">
        <h3>邀请好友</h3>
      </div>
      <div className="card-body text-center">
        {inviteCode ? (
          <>
            <p className="sub-title">你的专属邀请链接</p>
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="w-full bg-gray-200 text-center rounded px-2 py-1 mb-3"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl);
                alert('邀请链接已复制！');
              }}
              className="btn-recharge"
            >
              复制邀请链接
            </button>

            <div className="qr-code-info mt-4">
              <div className="inline-block bg-white p-2 rounded">
                <img src={qrCodeUrl} alt="二维码" width={200} height={200} />
              </div>
            </div>
          </>
        ) : (
          <p className="text-red-500">无法获取邀请码，请确认是否登录</p>
        )}
      </div>
    </div>
  );
};

export default InviteCard;

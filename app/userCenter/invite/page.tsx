//app/userCenter/invite/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import InviteCard from '../InviteCard'; // 注意路径相对位置

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setInviteCode(data.inviteCode ?? null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">邀请好友</h1>
      <InviteCard userData={{ inviteCode }} />
    </div>
  );
}

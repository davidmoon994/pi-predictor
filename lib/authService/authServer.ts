//lib/authServer.ts
import QRCode from 'qrcode';
import {
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  collection
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../firebase';
import { generateInviteCode } from './utils';

export async function handlePostRegister(user: User, displayName: string, inviterId?: string) {
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?inviter=${user.uid}`;
  const qrCodeUrl = await QRCode.toDataURL(referralLink);

  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    email: user.email,
    displayName,
    createdAt: serverTimestamp(),
    points: 0,
    level: 1,
    inviteCode: generateInviteCode(),
    invitedBy: inviterId || null,
    qrCodeUrl
  });

  if (inviterId) {
    const inviterRef = doc(db, 'users', inviterId);
    const inviterSnap = await getDoc(inviterRef);
    if (inviterSnap.exists()) {
      const commissionAmount = 0;
      await addDoc(collection(db, 'commissions'), {
        toUserId: inviterId,
        fromUserId: user.uid,
        type: 'register',
        amount: commissionAmount,
        createdAt: serverTimestamp(),
        level: 1
      });
      await updateDoc(inviterRef, {
        points: increment(commissionAmount)
      });
    }
  }
}

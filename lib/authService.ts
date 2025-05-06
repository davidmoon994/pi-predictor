// lib/authService.ts
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import QRCode from "qrcode";

export async function registerUser(email: string, password: string, displayName: string, inviterId?: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?inviter=${user.uid}`;
  const qrCodeUrl = await QRCode.toDataURL(referralLink);

  await setDoc(userRef, {
    email: user.email,
    createdAt: new Date(),
    points: 0,
    level: 1,
    inviteCode: generateInviteCode(),      // 生成自己的邀请码
    invitedBy: inviteCode || null,         // 如果通过链接注册，则记录推荐人
  });

  return user;
}

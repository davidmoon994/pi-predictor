// lib/registerService.ts
import { db, auth } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, User } from 'firebase/auth';
import QRCode from 'qrcode';

export async function generateQRCodeBase64(url: string): Promise<string> {
  try {
    const base64 = await QRCode.toDataURL(url);
    return base64;
  } catch (err) {
    console.error('生成二维码失败', err);
    return '';
  }
}

function generateInviteCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function isInviteCodeUnique(code: string): Promise<boolean> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('inviteCode', '==', code));
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

async function generateUniqueInviteCode(): Promise<string> {
  let code;
  let unique = false;
  while (!unique) {
    code = generateInviteCode();
    unique = await isInviteCodeUnique(code);
  }
  return code!;
}

export async function registerUserWithReferral({
  email,
  password, 
  displayName, 
  inviterCode,
}: {
  email: string;
  password: string;
  displayName: string;
  inviterCode?: string;
}) {
  // 注册 Firebase 用户
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const uid = user.uid;

  const inviteCode = await generateUniqueInviteCode();
  const inviteUrl = `https://yourdomain.com/register?ref=${inviteCode}`;
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(
    inviteUrl
  )}&chs=200x200&chld=L|0`;

  let parentId: string | null = null;
  let grandParentId: string | null = null;

  // 建立上下级关系
  if (inviterCode) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('inviteCode', '==', inviterCode));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const parentDoc = snapshot.docs[0];
      parentId = parentDoc.id;
      grandParentId = parentDoc.data().parentId || null;
    }
  }

  const userDoc = doc(db, 'users', uid);
  await setDoc(userDoc, {
    uid,
    email,
    displayName,
    inviteCode,
    inviteUrl,
    qrCodeUrl,
    parentId,
    grandParentId,
    createdAt: Date.now(),
    points: 0,
  });

  return user; // 返回新用户对象
}

// 如有其他地方使用以下命名导出也保持不变
export {
  generateInviteCode,
};

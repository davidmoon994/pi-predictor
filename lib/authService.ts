import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  increment,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import QRCode from 'qrcode';

// 注册函数
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  inviterId?: string
) {
  try {
    // 创建用户
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 更新显示名
    await updateProfile(user, { displayName });

    // 构建邀请链接与二维码
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?inviter=${user.uid}`;
    const qrCodeUrl = await QRCode.toDataURL(referralLink);

    // Firestore 中的用户文档路径
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      displayName: displayName,
      createdAt: serverTimestamp(),
      points: 0,
      level: 1,
      inviteCode: generateInviteCode(),
      invitedBy: inviterId || null,
      qrCodeUrl
    });

    // === 返佣逻辑 ===
    if (inviterId) {
      const inviterRef = doc(db, 'users', inviterId);
      const inviterSnap = await getDoc(inviterRef);

      if (inviterSnap.exists()) {
        // 返佣 2%
        const commissionAmount = 0; // 注册不返佣，下注时处理，这里只是结构预置
        await addDoc(collection(db, 'commissions'), {
          toUserId: inviterId,
          fromUserId: user.uid,
          type: 'register',
          amount: commissionAmount,
          createdAt: serverTimestamp(),
          level: 1
        });

        // 初始化分润账户积分（可选：同步返佣到账）
        await updateDoc(inviterRef, {
          points: increment(commissionAmount)
        });
      }
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message || '注册失败');
  }
}

// 登录函数
export async function signInUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || '登录失败');
  }
}

// 邀请码生成器
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// firebase/userService.ts

import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "./firebaseConfig"; // 引入 firebase.ts

const db = getFirestore(app);

// 新注册用户时，创建用户资料
export const createUserProfile = async (uid: string, email: string) => {
  const userRef = doc(db, "users", uid);

  const inviteCode = generateInviteCode(); // 自动生成一个邀请码

  const userData = {
    uid,
    email,
    nickname: "新用户",    // 默认昵称
    level: 1,             // 默认等级
    points: 100,          // 默认初始积分
    inviteCode: inviteCode,
    invitedBy: null,      // 谁邀请了他（后续可以加）
    createdAt: Date.now(),
  };

  try {
    await setDoc(userRef, userData);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// 生成简单的邀请码（6位随机字母数字）
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

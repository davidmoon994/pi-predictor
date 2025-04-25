// app/services/firestore.ts
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "@lib/firebase";

const db = getFirestore(app);

// �?获取 Pi 预测记录（示例用假数据）
export const getPiPredictions = async () => {
  // 示例：你可以�?firestore 实际数据替换这段假数�?
  return [
    { period: "20250401", result: "上涨" },
    { period: "20250331", result: "下跌" },
  ];
};

// �?新增保存预测函数（如果你后面用得上）
export const savePiPrediction = async (period: string, result: string) => {
  const predictionRef = doc(db, "piPredictions", period);
  await setDoc(predictionRef, { result });
};

// �?创建用户信息（用于注册时调用�?
export const createUserProfile = async (uid: string, email: string) => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    await setDoc(userRef, {
      email,
      createdAt: new Date().toISOString(),
    });
  }
};

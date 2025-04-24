import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  increment,
} from "firebase/firestore";

// 获取某一期的全部下注记录
export const getCurrentPeriodBets = async (periodId: string) => {
  const q = query(collection(db, "bets"), where("periodId", "==", periodId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// 开奖逻辑：处理奖池、销毁、赢家分配、分润
export const settleBetsForPeriod = async (periodId: string) => {
  const bets = await getCurrentPeriodBets(periodId);
  if (bets.length === 0) throw new Error("本期无投注记录");

  // 简单规则：随机选中 “up” 或 “down” 为赢家
  const result = Math.random() < 0.5 ? "up" : "down";

  const totalPool = bets.reduce((sum, b) => sum + b.amount, 0);
  const burnAmount = Math.floor(totalPool * 0.06);
  const distributable = totalPool - burnAmount;

  const winners = bets.filter((b) => b.direction === result);
  const totalWinnerStake = winners.reduce((sum, b) => sum + b.amount, 0);

  for (const bet of bets) {
    const userRef = doc(db, "users", bet.userId);

    // 分润处理（不管输赢都执行）
    const refReward1 = Math.floor(bet.amount * 0.02);
    const refReward2 = Math.floor(bet.amount * 0.01);

    if (bet.invitedBy) {
      const ref1Query = query(collection(db, "users"), where("inviteCode", "==", bet.invitedBy));
      const ref1Snap = await getDocs(ref1Query);
      if (!ref1Snap.empty) {
        const ref1Doc = ref1Snap.docs[0];
        await updateDoc(doc(db, "users", ref1Doc.id), {
          points: increment(refReward1),
        });

        // 获取上上级
        const ref1Data = ref1Doc.data();
        if (ref1Data.invitedBy) {
          const ref2Query = query(collection(db, "users"), where("inviteCode", "==", ref1Data.invitedBy));
          const ref2Snap = await getDocs(ref2Query);
          if (!ref2Snap.empty) {
            const ref2Doc = ref2Snap.docs[0];
            await updateDoc(doc(db, "users", ref2Doc.id), {
              points: increment(refReward2),
            });
          }
        }
      }
    }

    // 赢家收益发放
    if (bet.direction === result) {
      const reward = Math.floor((bet.amount / totalWinnerStake) * distributable);
      await updateDoc(userRef, {
        points: increment(reward),
      });
    }
  }
    // 获取指定期号的开奖结果
     export const getResultForPeriod = async (periodId: string) => {
  const q = query(collection(db, "results"), where("periodId", "==", periodId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data(); // 只取第一个结果
  }
  

     // 获取所有开奖结果，按 periodId 映射
    export const getAllResults = async () => {
  const snapshot = await getDocs(collection(db, "results"));
  const results: Record<string, string> = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.periodId && data.result) {
      results[data.periodId] = data.result;
    }
  });

  return result;
};

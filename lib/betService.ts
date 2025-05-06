import { db } from "./firebase";
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
  arrayUnion,
} from "firebase/firestore";

// 下单下注并写入记�?& 扣除积分
export async function placeBet(
  userId: string,
  period: string,
  direction: "up" | "down",
  amount: number,
  invitedBy?: string
) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  if (!userSnap.exists() || userData.points < amount) {
    throw new Error("用户不存在或积分不足");
  }

  // 先扣除用户积�?
  await updateDoc(userRef, {
    points: userData.points - amount,
  });

  // 然后添加下注记录
  await addDoc(collection(db, "bets"), {
    userId,
    periodId: period,
    direction,
    amount,
    timestamp: Date.now(),
    invitedBy: invitedBy || userData.invitedBy || null,
  });
}

// 获取某一期的全部下注记录
export const getCurrentPeriodBets = async (periodId: string) => {
  const q = query(collection(db, "bets"), where("periodId", "==", periodId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// 开奖逻辑：处理奖池、销毁、赢家分配、分�?
export const settleBetsForPeriod = async (periodId: string) => {
  const bets = await getCurrentPeriodBets(periodId);
  if (bets.length === 0) throw new Error("本期无投注记录");

  const result = Math.random() < 0.5 ? "up" : "down";

  const totalPool = bets.reduce((sum, b) => sum + b.amount, 0);
  const burnAmount = Math.floor(totalPool * 0.06);
  const distributable = totalPool - burnAmount;

  const winners = bets.filter((b) => b.direction === result);
  const totalWinnerStake = winners.reduce((sum, b) => sum + b.amount, 0);

  for (const bet of bets) {
    const userRef = doc(db, "users", bet.userId);

    // 分润处理
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

    // 赢家收益分配
    if (bet.direction === result) {
      const reward = Math.floor((bet.amount / totalWinnerStake) * distributable);
      await updateDoc(userRef, {
        points: increment(reward),
      });
    }
  }

  // 可选：保存开奖结果到 Firestore
  await addDoc(collection(db, "results"), {
    periodId,
    result,
    timestamp: Date.now(),
  });

  return result;
};

// 获取指定期号的开奖结�?
export const getResultForPeriod = async (periodId: string) => {
  const q = query(collection(db, "results"), where("periodId", "==", periodId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data(); // 只取第一个结�?
  }
  return null;
};

// 获取所有开奖结�?
export const getAllResults = async () => {
  const snapshot = await getDocs(collection(db, "results"));
  const results: Record<string, string> = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.periodId && data.result) {
      results[data.periodId] = data.result;
    }
  });

  return results;
};

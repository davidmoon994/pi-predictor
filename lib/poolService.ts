import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// 奖池结构存储�?pools/{periodId} �?
export const updatePoolAfterBet = async (
  periodId: string,
  amount: number,
  direction: "up" | "down"
) => {
  const poolRef = doc(db, "pools", periodId);
  const poolSnap = await getDoc(poolRef);

  if (!poolSnap.exists()) {
    // 第一次下注，初始化奖�?
    await setDoc(poolRef, {
      periodId,
      total: amount,
      upTotal: direction === "up" ? amount : 0,
      downTotal: direction === "down" ? amount : 0,
      bets: [{ amount, direction }],
      resolved: false,
    });
  } else {
    const data = poolSnap.data();
    await updateDoc(poolRef, {
      total: data.total + amount,
      upTotal: data.upTotal + (direction === "up" ? amount : 0),
      downTotal: data.downTotal + (direction === "down" ? amount : 0),
      bets: [...(data.bets || []), { amount, direction }],
    });
  }
};

// 开奖结算逻辑
export const resolvePool = async (
  periodId: string,
  winningDirection: "up" | "down"
) => {
  const poolRef = doc(db, "pools", periodId);
  const poolSnap = await getDoc(poolRef);
  if (!poolSnap.exists()) throw new Error("奖池不存�?);

  const pool = poolSnap.data();
  if (pool.resolved) throw new Error("已结�?);

  const totalPool = pool.total;
  const destroyAmount = totalPool * 0.06; // 销�?%
  const remaining = totalPool - destroyAmount;

  const winTotal =
    winningDirection === "up" ? pool.upTotal : pool.downTotal;

  // 获取所有中奖下注记�?
  const winners = (pool.bets || []).filter(
    (bet) => bet.direction === winningDirection
  );

  // 分配奖金
  for (const winner of winners) {
    const reward = (winner.amount / winTotal) * remaining;

    // 更新用户积分
    const userRef = doc(db, "users", winner.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      await updateDoc(userRef, {
        points: (userData.points || 0) + reward,
      });
    }
  }

  // 更新奖池为已结算状�?
  await updateDoc(poolRef, {
    resolved: true,
    winningDirection,
    destroyAmount,
  });
};

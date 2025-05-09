// lib/poolService.ts
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// 更新奖池
export const updatePoolAfterBet = async (
  periodId: string,
  amount: number,
  direction: "up" | "down"
) => {
  const poolRef = doc(db, "pools", periodId);
  const poolSnap = await getDoc(poolRef);

  if (!poolSnap.exists()) {
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

// 结算奖池
export const resolvePool = async (periodId: string, winningDirection: "up" | "down") => {
  const poolRef = doc(db, "pools", periodId);
  const poolSnap = await getDoc(poolRef);
  if (!poolSnap.exists()) throw new Error("奖池不存在");

  const pool = poolSnap.data();
  if (pool.resolved) throw new Error("已结算");

  const totalPool = pool.total;
  const destroyed = Math.floor(totalPool * 0.06); // 销毁6%
  const remaining = totalPool - destroyed;

  const winners = (pool.bets || []).filter((bet) => bet.direction === winningDirection);

  for (const winner of winners) {
    const reward = (winner.amount / remaining) * remaining;
    const userRef = doc(db, "users", winner.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      await updateDoc(userRef, {
        points: (userData.points || 0) + reward,
      });
    }
  }

  await updateDoc(poolRef, {
    resolved: true,
    winningDirection,
    destroyed,
  });
};

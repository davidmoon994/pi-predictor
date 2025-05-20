// lib/drawService.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { resolvePool } from "./poolService";

async function getBetsByPeriod(periodId: string) {
  const betQuery = query(collection(db, "bets"), where("periodId", "==", periodId));
  const betSnap = await getDocs(betQuery);
  return betSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// 真正的开奖函数（由 UI 倒计时控制触发）
export async function drawAndSettle(periodId: string, openPrice: number, closePrice: number) {
  const allBets = await getBetsByPeriod(periodId);
  if (allBets.length === 0) return;

  const result = closePrice > openPrice ? "up" : closePrice < openPrice ? "down" : "draw";
  const totalPool = allBets.reduce((sum, b) => sum + b.amount, 0);
  const destroyed = Math.floor(totalPool * 0.06); // 销毁部分
  const remaining = totalPool - destroyed;

  const rewards = [];

  for (const bet of allBets) {
    let reward = 0;
    if (result === "draw") {
      reward = bet.amount; // 平局退还
    } else if (bet.direction === result) {
      reward = Math.floor((bet.amount / totalPool) * remaining * 2); // 赢得奖池份额 * 2
    }

    if (reward > 0) {
      await updateDoc(doc(db, "users", bet.userId), {
        points: increment(reward),
      });

      rewards.push({ userId: bet.userId, amount: reward });
    }
  }

  // 写入开奖结果
  await addDoc(collection(db, "results"), {
    periodId,
    openPrice,
    closePrice,
    result,
    totalPool,
    destroyed,
    rewards,
    timestamp: Date.now(),
  });

  // 奖池结算
  await resolvePool(periodId, result);
}

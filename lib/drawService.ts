// lib/drawService.ts
import { db } from "./firebase";
import { getCurrentPeriodId } from './utils';
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

type BetRecord = {
  id: string;
  amount: number;
  userId: string;
  direction: "up" | "down";
  periodId: string;
  // 其他字段根据需要补充
};

async function getBetsByPeriod(periodId: string): Promise<BetRecord[]> {
  const betQuery = query(collection(db, "bets"), where("periodId", "==", periodId));
  const betSnap = await getDocs(betQuery);
  return betSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      amount: data.amount as number,
      userId: data.userId as string,
      direction: data.direction as "up" | "down",
      periodId: data.periodId as string,
      // 如果有其他字段也补充在这里
    };
  });
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
await resolvePool(periodId);
}

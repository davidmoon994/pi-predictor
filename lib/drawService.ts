// lib/drawService.ts
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { resolvePool } from "./poolService"; // 引入奖池结算函数

// 获取下注记录
async function getBetsByPeriod(periodId: string) {
  const betQuery = query(collection(db, "bets"), where("periodId", "==", periodId));
  const betSnap = await getDocs(betQuery);
  return betSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// 开奖逻辑
export async function drawAndSettle(periodId: string, openPrice: number, closePrice: number) {
  const allBets = await getBetsByPeriod(periodId);
  if (allBets.length === 0) return;

  const result = closePrice > openPrice ? "up" : "down";

  const totalPool = allBets.reduce((sum, b) => sum + b.amount, 0);
  const destroyed = Math.floor(totalPool * 0.06);
  const remaining = totalPool - destroyed;

  // 分配奖池奖励
  for (const bet of allBets) {
    const reward = Math.floor((bet.amount / totalPool) * remaining);
    await updateDoc(doc(db, "users", bet.userId), {
      points: increment(reward),
    });
  }

  // 更新奖池为已结算
  await resolvePool(periodId, result); // 调用奖池结算函数
}

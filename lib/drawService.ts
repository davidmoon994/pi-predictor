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
  setDoc,
} from "firebase/firestore";
import { clearPoolAfterSettle } from "./poolService";

type BetRecord = {
  id: string;
  amount: number;
  userId: string;
  direction: "up" | "down";
  periodId: string;
};

// 本地缓存最近若干期结算数据（你也可以用 Zustand 统一管理）
let recentPeriods: PeriodData[] = [];

export interface PeriodData {
  periodNumber: number;
  readableTime: string;
  open: number;
  close: number;
  high: number;
  low: number;
  poolAmount: number;
  upAmount: number;
  downAmount: number;
  riseFallRatio: string;
}

async function getBetsByPeriod(periodId: string): Promise<BetRecord[]> {
  const betQuery = query(collection(db, "bets"), where("periodId", "==", periodId));
  const betSnap = await getDocs(betQuery);
  return betSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      amount: data.amount as number,
      userId: data.userId as string,
      direction: data.direction as "up" | "down",
      periodId: data.periodId as string,
    };
  });
}

// 添加或更新本地缓存最近10期结算数据
export function addPeriodData(data: PeriodData) {
  // 新期加入头部
  recentPeriods.unshift(data);

  // 保持最多10期
  if (recentPeriods.length > 10) {
    recentPeriods = recentPeriods.slice(0, 10);
  }
}

// 外部调用获取最近10期缓存数据
export function getRecentPeriods(): PeriodData[] {
  return recentPeriods;
}

export async function drawAndSettle(
  periodNumber: number,
  open: number,
  close: number,
  high: number,
  low: number,
  poolAmount: number,
  upAmount: number,
  downAmount: number,
  periodStartTime: number
) {
  const periodId = periodNumber.toString();
  const allBets = await getBetsByPeriod(periodId);
  if (allBets.length === 0) return;

  const result = close > open ? "up" : close < open ? "down" : "draw";
  const totalPool = allBets.reduce((sum, b) => sum + b.amount, 0);
  const destroyed = Math.floor(totalPool * 0.06);
  const remaining = totalPool - destroyed;

  const rewards: { userId: string; amount: number }[] = [];

  for (const bet of allBets) {
    let reward = 0;
    if (result === "draw") {
      reward = bet.amount;
    } else if (bet.direction === result) {
      reward = Math.floor((bet.amount / totalPool) * remaining * 2);
    }

    if (reward > 0) {
      await updateDoc(doc(db, "users", bet.userId), {
        points: increment(reward),
      });

      rewards.push({ userId: bet.userId, amount: reward });
    }
  }

  // 写入 period 结算数据到 Firestore
  const periodDoc = doc(db, "periods", periodId);
  await setDoc(periodDoc, {
    periodNumber,
    open,
    close,
    high,
    low,
    result,
    totalPool,
    destroyed,
    upAmount,
    downAmount,
    createdAt: Date.now(),
  });

  // 写入结算详情
  await addDoc(collection(db, "results"), {
    periodNumber,
    open,
    close,
    result,
    totalPool,
    destroyed,
    rewards,
    timestamp: Date.now(),
  });

  // 清理奖池
  await clearPoolAfterSettle(periodId);

  // 计算涨跌比例字符串
  const totalUpDown = upAmount + downAmount;
  const riseFallRatio =
    totalUpDown === 0
      ? "0:0"
      : `${((upAmount / totalUpDown) * 100).toFixed(1)}% : ${((downAmount / totalUpDown) * 100).toFixed(1)}%`;

  // 缓存本期数据，供 PastCard 显示
  addPeriodData({
    periodNumber,
    readableTime: new Date(periodStartTime).toLocaleString(),
    open,
    close,
    high,
    low,
    poolAmount: totalPool,
    upAmount,
    downAmount,
    riseFallRatio,
  });
}

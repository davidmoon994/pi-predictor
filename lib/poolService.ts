import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { drawAndSettle } from './drawService';
import { getKlineFromFirestore } from './getKlineFromFirestore';
import triggerEasterEggIfNeeded  from '@/components/effects/EasterEgg'; // 可选
import { getLatestPiPrice } from '@/hooks/useLatestPiPrice'; // 可选

// 获取某一期奖池总金额
export const getPoolAmount = async (period: string): Promise<number> => {
  const poolDoc = await getDoc(doc(db, 'pools', period));
  return poolDoc.exists() ? poolDoc.data().totalAmount || 0 : 0;
};

// 获取奖池详情
export const getPoolDetail = async (period: string) => {
  const poolDoc = await getDoc(doc(db, 'pools', period));
  return poolDoc.exists() ? poolDoc.data() : null;
};

// 初始化奖池（首次创建该期时调用）
export const initPoolIfNotExists = async (period: string): Promise<void> => {
  const poolRef = doc(db, 'pools', period);
  const poolSnap = await getDoc(poolRef);
  if (!poolSnap.exists()) {
    await setDoc(poolRef, {
      upAmount: 0,
      downAmount: 0,
      totalAmount: 0,
      createdAt: serverTimestamp(),
    });
  }
};

export async function settlePoolForPeriod(periodId: string) {
  // 实现逻辑，或者暂时占位
  console.log("Settling pool for period:", periodId);
}


// 用户下注后更新奖池金额
export const updatePoolAfterBet = async (
  period: string,
  direction: 'up' | 'down',
  amount: number
): Promise<void> => {
  const poolRef = doc(db, 'pools', period);
  const poolSnap = await getDoc(poolRef);

  if (!poolSnap.exists()) {
    await setDoc(poolRef, {
      upAmount: direction === 'up' ? amount : 0,
      downAmount: direction === 'down' ? amount : 0,
      totalAmount: amount,
      createdAt: serverTimestamp(),
    });
  } else {
    const data = poolSnap.data();
    const newUp = data.upAmount || 0;
    const newDown = data.downAmount || 0;

    await updateDoc(poolRef, {
      upAmount: direction === 'up' ? newUp + amount : newUp,
      downAmount: direction === 'down' ? newDown + amount : newDown,
      totalAmount: (data.totalAmount || 0) + amount,
    });
  }
};

// 获取该期所有下注记录
const getBetsForPeriod = async (period: string) => {
  const betsRef = collection(db, 'bets');
  const q = query(betsRef, where('period', '==', period));
  const querySnapshot = await getDocs(q);

  const bets: {
    userId: string;
    direction: 'up' | 'down';
    amount: number;
  }[] = [];

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    bets.push({
      userId: data.userId,
      direction: data.direction,
      amount: data.amount,
    });
  });

  return bets;
};

// 结算奖池，自动判断涨跌方向
export const resolvePool = async (periodId: string) => {
  const poolRef = doc(db, 'pools', periodId);
  const poolSnap = await getDoc(poolRef);
  if (!poolSnap.exists()) throw new Error('奖池不存在');

  const pool = poolSnap.data();
  if (pool.resolved) throw new Error('已结算');

  // 获取该期K线数据用于判断涨跌
  const kline = await getKlineFromFirestore(periodId);
  if (!kline) throw new Error('找不到该期的K线数据');

  const open = parseFloat(kline.open);
  const close = parseFloat(kline.close);
  const winningDirection = close > open ? 'up' : 'down';

  // 获取下注记录
  const bets = await getBetsForPeriod(periodId);
  if (!bets.length) throw new Error('该期无下注记录');

  // 销毁 6%
  const totalAmount = pool.totalAmount || 0;
  const destroyed = Math.floor(totalAmount * 0.06);
  const rewardPool = totalAmount - destroyed;

  // 计算赢家和总获胜金额
  const winners = bets.filter(b => b.direction === winningDirection);
  const totalWinningAmount = winners.reduce((sum, w) => sum + w.amount, 0);

  for (const winner of winners) {
    const reward = Math.floor((winner.amount / totalWinningAmount) * rewardPool);

    const userRef = doc(db, 'users', winner.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const user = userSnap.data();
      await updateDoc(userRef, {
        points: (user.points || 0) + reward,
      });
    }
  }

  // 更新奖池状态
  await updateDoc(poolRef, {
    resolved: true,
    winningDirection,
    destroyed,
  });

  // 分润积分 + 记录到 commissions
  await drawAndSettle(periodId);

  // 可选触发彩蛋
  await triggerEasterEggIfNeeded?.(periodId, winningDirection);
};


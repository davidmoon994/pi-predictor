// lib/betService.ts
import { db } from "./firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePoolAfterBet } from "./poolService"; // 引入奖池更新函数

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

  // 更新奖池
  await updatePoolAfterBet(period, amount, direction); // 更新奖池

  // 然后添加下注记录
  await addDoc(collection(db, "bets"), {
    userId,
    periodId: period,
    direction,
    amount,
    timestamp: Date.now(),
    invitedBy: invitedBy || userData.invitedBy || null,
  });

  // 处理分润逻辑
  if (invitedBy || userData.invitedBy) {
    // 一级和二级分润
    const refReward1 = Math.floor(amount * 0.02);
    const refReward2 = Math.floor(amount * 0.01);

    const ref1Query = query(collection(db, "users"), where("inviteCode", "==", invitedBy || userData.invitedBy));
    const ref1Snap = await getDocs(ref1Query);

    if (!ref1Snap.empty) {
      const ref1Doc = ref1Snap.docs[0];
      await updateDoc(doc(db, "users", ref1Doc.id), {
        points: increment(refReward1),
      });

      // 二级分润
      const ref2Data = ref1Doc.data();
      if (ref2Data.invitedBy) {
        const ref2Query = query(collection(db, "users"), where("inviteCode", "==", ref2Data.invitedBy));
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
}

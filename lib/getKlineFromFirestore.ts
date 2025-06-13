// lib/getKlineFromFirestore.ts
import { getFirestore } from './firebase-admin';

const firestore = getFirestore();

export async function getLatestPriceFromFirestore(token: string = 'PI') {
  const snapshot = await firestore
    .collection('klineCache')
    .where('token', '==', token)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    return data?.close ?? null;
  }

  return null;
}

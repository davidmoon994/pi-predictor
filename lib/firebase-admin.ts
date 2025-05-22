// lib/firebase-admin.ts
import admin from 'firebase-admin';

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!base64) {
  throw new Error("❌ 缺少环境变量 FIREBASE_SERVICE_ACCOUNT_BASE64");
}

let serviceAccount: admin.ServiceAccount;

try {
  const jsonString = Buffer.from(base64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(jsonString);
} catch (error) {
  console.error("❌ 无法解析 FIREBASE_SERVICE_ACCOUNT_BASE64:", error);
  throw new Error("❌ 环境变量 FIREBASE_SERVICE_ACCOUNT_BASE64 无效，Base64 解码或 JSON 解析失败");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();

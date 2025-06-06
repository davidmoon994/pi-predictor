// lib/firebase-admin.ts
import admin from 'firebase-admin';

export function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app(); // 返回已初始化的默认 app
  }

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
    throw new Error("❌ 环境变量 FIREBASE_SERVICE_ACCOUNT_BASE64 无效");
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function getFirestore() {
  return getFirebaseAdminApp().firestore();
}


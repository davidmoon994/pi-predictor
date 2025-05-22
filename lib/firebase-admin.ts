// lib/firebase-admin.ts
import admin from 'firebase-admin';

const serviceAccountJson = Buffer
  .from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64')
  .toString('utf-8');

const serviceAccount = JSON.parse(serviceAccountJson);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


export const db = admin.firestore();

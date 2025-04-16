import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiysHgtuiu5tv2-_e36ga-dSg7ieJuH4M",
  authDomain: "pi-predictor.firebaseapp.com",
  projectId: "pi-predictor",
  storageBucket: "pi-predictor.firebasestorage.app",
  messagingSenderId: "343913166257",
  appId: "1:343913166257:web:0b05ec875561580cb83990"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化服务
const auth = getAuth(app);
const db = getFirestore(app);

// 导出模块
export { app, auth, db };
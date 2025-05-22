// encode-key.js
const fs = require('fs');

const json = fs.readFileSync('./pi-predictor-firebase-adminsdk-fbsvc-a576c1656a.json', 'utf-8');
const base64 = Buffer.from(json).toString('base64');

console.log('👇 拷贝下面的内容到 .env.local');
console.log(`FIREBASE_SERVICE_ACCOUNT_BASE64=${base64}`);
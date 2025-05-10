// fetchKline.js
const fetch = require('node-fetch'); // 引入 node-fetch 库

async function fetchKlineData() {
  const url = 'https://api.gate.io/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=1';
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log('Kline Data:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchKlineData();

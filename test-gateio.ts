// test-gateio.ts
import axios from "axios";

(async () => {
  try {
    const res = await axios.get(
      "https://api.gateio.ws/api/v4/spot/candlesticks",
      {
        params: {
          currency_pair: "PI_USDT",
          interval: "5m",
          limit: 100,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        },
      }
    );
    console.log("✅ 成功获取数据:", res.data.length);
  } catch (err: any) {
    console.error("❌ 请求失败:", err.response?.status, err.response?.data);
  }
})();

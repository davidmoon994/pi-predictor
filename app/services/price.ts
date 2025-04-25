// app/services/price.ts
export const fetchPiPrice = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd");
      const data = await response.json();
      return data["pi-network"].usd;
    } catch (error) {
      console.error("获取 Pi 币价格失败：", error);
      return null;
    }
  };

export const fetchPiPrice = async (): Promise<number | null> => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd',
        { cache: 'no-store' }
      );
      const data = await res.json();
      return data['pi-network']?.usd || null;
    } catch (err) {
      console.error('获取 Pi 币价格失�?', err);
      return null;
    }
  };

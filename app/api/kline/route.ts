import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 模拟返回 50 条数据
    const now = Date.now();
    const interval = 60 * 1000; // 每分钟一条

    const data = Array.from({ length: 50 }).map((_, i) => {
      const timestamp = new Date(now - (49 - i) * interval).toISOString();
      const open = 0.598 + Math.random() * 0.01;
      const close = open + (Math.random() - 0.5) * 0.02;
      const high = Math.max(open, close) + Math.random() * 0.005;
      const low = Math.min(open, close) - Math.random() * 0.005;

      return {
        time: timestamp,
        open: Number(open.toFixed(5)),
        close: Number(close.toFixed(5)),
        high: Number(high.toFixed(5)),
        low: Number(low.toFixed(5)),
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("获取K线数据失败:", error);
    return new NextResponse("获取K线数据失败", { status: 500 });
  }
}
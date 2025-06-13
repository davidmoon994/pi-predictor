// app/components/KLineChart.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  type CandlestickData,
  type UTCTimestamp,
} from "lightweight-charts";

type KLineProps = {
  data: Array<{
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
};

export default function KLineChart({ data }: { data: Array<{ time: UTCTimestamp; open: number; high: number; low: number; close: number }> }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const candleSeriesRef = useRef<any>(null);

  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 这里不显式声明 chart 类型，交给 TS 自动推断
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 240,
      layout: { background: { color: "#000" }, textColor: "#facc15" },
      grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
    });

    chartRef.current = chart;

    // 这里正常调用，TS 不会报错了
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candleSeriesRef.current = candleSeries;

    const candleData = data.map((item) => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    candleSeries.setData(candleData);

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }

      const seriesData = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      if (!seriesData) {
        setHoverData(null);
        return;
      }
      
      setHoverData({
        time: new Date((param.time as number) * 1000).toLocaleString(),
        open: seriesData.open,
        high: seriesData.high,
        low: seriesData.low,
        close: seriesData.close,
      });
    }); // ✅ 补上这个右括号！
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, 240);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      chart.remove();
      window.removeEventListener("resize", handleResize);
    };
  }, [data]);

  return (
    <div style={{ position: "relative", width: "100%", height: "240px" }}>
      <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
      {hoverData && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            padding: "4px 8px",
            fontSize: "12px",
            color: "#facc15",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 10,
          }}
        >
          时间: {hoverData.time}
          <br />
          开盘: {hoverData.open}
          <br />
          收盘: {hoverData.close}
          <br />
          最高: {hoverData.high}
          <br />
          最低: {hoverData.low}
        </div>
      )}
    </div>
  );
}

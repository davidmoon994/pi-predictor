"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

// 给组件添加 props 接口，支持 className
interface KLineChartProps {
  className?: string; // 新增 className 属性
}

const KLineChart: React.FC<KLineChartProps> = ({ className }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current!);

    fetch("/api/kline")
      .then((res) => res.json())
      .then((data) => {
        const xData = data.map((item: any) => item.time);
        const kData = data.map((item: any) => [
          item.open,
          item.close,
          item.low,
          item.high,
        ]);

        chart.setOption({
          backgroundColor: "#1E293B",
          textStyle: {
            color: "#CBD5E1",
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross",
            },
          },
          xAxis: {
            type: "category",
            data: xData,
            axisLine: { lineStyle: { color: "#ccc" } },
            axisLabel: { formatter: (val: string) => val.slice(11, 16) },
          },
          yAxis: {
            scale: true,
            axisLine: { lineStyle: { color: "#ccc" } },
          },
          series: [
            {
              type: "candlestick",
              data: kData,
              itemStyle: {
                color: "#26A69A",
                color0: "#EF5350",
                borderColor: "#26A69A",
                borderColor0: "#EF5350",
              },
            },
          ],
        });
      });

    return () => {
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} className={className} style={{ height: 400, width: "100%" }} />;
};

export default KLineChart;

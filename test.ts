// test.ts
// test.ts (临时文件)
import { createChart } from "lightweight-charts";

const chart = createChart(document.createElement("div"));

const candleSeries = chart.addCandlestickSeries({
  upColor: "#26a69a",
  downColor: "#ef5350",
  borderVisible: false,
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350",
});

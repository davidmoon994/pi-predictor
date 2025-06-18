// lib/utils/period.ts

export function getPeriodNumber(timestamp: number): number {
  return Math.floor(timestamp / 300);
}

export function formatReadableTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const bjTime = new Date(date.getTime() + 8 * 60 * 60 * 1000); // UTC+8

  const month = bjTime.getMonth() + 1;
  const day = bjTime.getDate();
  const hour = bjTime.getHours();
  const minute = bjTime.getMinutes().toString().padStart(2, '0');

  return `${month}-${day} ${hour}:${minute}`;
}

// ✅ 新增：用于前端 UI 展示的简洁期号（保留最后 3 位）
export function getDisplayPeriodNumber(periodNumber: number): string {
  return `#${String(periodNumber).slice(-3)}`;
}

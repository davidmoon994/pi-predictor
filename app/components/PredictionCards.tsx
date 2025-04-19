"use client";
import React, { useState, useEffect } from "react";

// 生成期号的方法：从当前时间开始，每天有288期
const generateCardData = () => {
  const currentDate = new Date();
  const cards = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(currentDate);
    date.setMinutes(date.getMinutes() + i * 5); // 每5分钟一期
    const period = `${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${i + 1}`;
    cards.push({
      title: period,
      content: "内容展示",
      result: `详情${i + 1}`,
      status: i === 2 ? "active" : i === 1 || i === 3 ? "completed" : "upcoming", // 设置卡片的状态
    });
  }
  return cards;
};

export default function CardSlider() {
  const [dummyCards] = useState(generateCardData());

  return (
    <div className="overflow-x-hidden flex justify-center items-center w-full py-4">
      <div className="flex gap-4 w-full max-w-6xl">
        {/* 左侧：往期已开奖卡片 */}
        <div
          className="min-w-[200px] bg-gray-800 p-4 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          <h3 className="text-lg font-bold mb-2">{dummyCards[1].title}</h3>
          <p className="text-sm text-gray-300">{dummyCards[1].content}</p>
          <p className="text-green-400 mt-2">{dummyCards[1].result}</p>
        </div>

        {/* 居中的正在开奖卡片 */}
        <div
          className="min-w-[200px] bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-4 rounded-lg shadow-lg hover:scale-105 transition-transform"
        >
          <h3 className="text-lg font-bold mb-2">{dummyCards[2].title}</h3>
          <p className="text-sm text-gray-300">{dummyCards[2].content}</p>
          <p className="text-green-400 mt-2">{dummyCards[2].result}</p>
        </div>

        {/* 右侧：下一期可立即投注 */}
        <div
          className="min-w-[200px] bg-gray-800 p-4 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          <h3 className="text-lg font-bold mb-2">{dummyCards[3].title}</h3>
          <p className="text-sm text-gray-300">{dummyCards[3].content}</p>
          <p className="text-green-400 mt-2">{dummyCards[3].result}</p>
        </div>

        {/* 右二：已经开奖的卡片 */}
        <div
          className="min-w-[200px] bg-gray-800 p-4 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          <h3 className="text-lg font-bold mb-2">{dummyCards[4].title}</h3>
          <p className="text-sm text-gray-300">{dummyCards[4].content}</p>
          <p className="text-green-400 mt-2">{dummyCards[4].result}</p>
        </div>
      </div>

      {/* 控制左右箭头来滑动历史卡片 */}
      <div className="mt-4 flex justify-center space-x-4">
        <button className="px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600">←</button>
        <button className="px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600">→</button>
      </div>
    </div>
  );
}

"use client";
import React from "react";

const dummyCards = [
  { title: "UP", content: "涨", result: "1.21 → 1.23" },
  { title: "UP", content: "跌", result: "1.23 → 1.19" },
  { title: "UP", content: "涨", result: "1.18 → 1.22" },
  { title: "Link", content: "预测下一期", result: "" },
  { title: "Next", content: "即将开奖", result: "倒计时 02:45" },
  { title: "Later", content: "下注即将开始", result: "倒计时 04:00" },
];

export default function CardSlider() {
  return (
    <div className="overflow-x-auto whitespace-nowrap scrollbar-hide px-2 w-full max-w-6xl">
      <div className="flex gap-4">
        {dummyCards.map((card, index) => (
          <div
            key={index}
            className="bg-gray-800 min-w-[180px] rounded-lg p-4 shadow-md hover:scale-105 transition-transform"
          >
            <h3 className="text-lg font-bold mb-2">{card.title}</h3>
            <p className="text-sm text-gray-300">{card.content}</p >
            {card.result && <p className="text-green-400 mt-2">{card.result}</p >}
            {card.title === "下注" && (
              <button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 rounded transition">
                去下注
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
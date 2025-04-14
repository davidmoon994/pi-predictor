'use client'

import { useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";


export default function PredictionCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 300;
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 300;
    }
  };

  const cardData = ["前一期", "前二期", "前三期", "下注", "Next", "Later"];

  return (
    <div className="flex flex-col items-center w-full my-4">
      {/* 第二行：箭头控制 */}
      <div className="flex space-x-6 mb-6">
  <button
    onClick={scrollLeft}
    className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transform transition duration-300 ease-in-out flex items-center justify-center"
  >
    <FaArrowLeft className="text-3xl drop-shadow-lg" />
  </button>
  <button
    onClick={scrollRight}
    className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transform transition duration-300 ease-in-out flex items-center justify-center"
  >
    <FaArrowRight className="text-3xl drop-shadow-lg" />
  </button>
</div>

      {/* 第三行：滑动卡片 */}
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 w-full max-w-6xl"
      >
        {cardData.map((title, index) => (
          <div
            key={index}
            className="min-w-[200px] flex-shrink-0 p-[2px] rounded-xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 shadow-xl hover:shadow-yellow-400/60 transition-transform transform hover:-translate-y-1 hover:scale-105 animate-fade-in"
          >
            <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 text-center text-white">
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-gray-400">开奖详情/内容展示</p >
              {title === "下注" && (
                <div className="mt-3 flex flex-col space-y-2">
                  <button className="bg-green-500 text-white px-4 py-1 rounded-xl shadow-md hover:bg-green-600 transition duration-300">
                    买涨
                  </button>
                  <button className="bg-red-500 text-white px-4 py-1 rounded-xl shadow-md hover:bg-red-600 transition duration-300">
                    买跌
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
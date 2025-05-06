import React from 'react';

interface CardProps {
  title: string;
  issueId: string;
  type?: 'past' | 'current' | 'next' | 'upcoming';
  content?: string;
  time?: string;
}

const getCardColor = (type: CardProps['type']) => {
  switch (type) {
    case 'past':
      return 'from-gray-700 to-gray-900';
    case 'current':
      return 'from-purple-500 to-indigo-600';
    case 'next':
      return 'from-blue-500 to-teal-500';
    case 'upcoming':
      return 'from-yellow-500 to-orange-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export default function Card({ title, issueId, type = 'past', content, time }: CardProps) {
  return (
    <div
      className={`
        w-64 h-40 rounded-xl p-4 text-white shadow-lg 
        bg-gradient-to-br ${getCardColor(type)} 
        transform transition duration-300 hover:scale-105
      `}
    >
      <div className="flex justify-between text-sm">
        <div>{title}</div>
        <div className="opacity-80">{issueId}</div>
      </div>
      <div className="mt-6 text-xl font-bold">{content || '预测内容'}</div>
      <div className="mt-4 text-xs text-right">{time || '倒计�?03:15'}</div>
    </div>
  );
}

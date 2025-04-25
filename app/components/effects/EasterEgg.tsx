'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function EasterEgg() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const audio = new Audio('/sound/easter-egg.mp3'); // 音效放在 public 目录
    audio.play();

    const timeout = setTimeout(() => {
      setVisible(false);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex flex-wrap justify-center items-center animate-fade-in z-50 pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <Image
          key={i}
          src="/images/pi-sparkle.png"
          alt=" Pi Easter Egg"
          width={40}
          height={40}
          style={{
            position: 'absolute',
            top: `${Math.random() * 60 + 20}%`,
            left: `${Math.random() * 80 + 10}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: 'float 10s ease-in-out infinite',
            opacity: 0.8,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

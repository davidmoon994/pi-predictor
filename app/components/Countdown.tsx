'use client';
import { useState, useEffect } from 'react';

interface CountdownProps {
  seconds: number;
  onEnd?: () => void;
}

const Countdown = ({ seconds, onEnd }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onEnd]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return <span>{formatTime(timeLeft)}</span>;
};

export default Countdown;
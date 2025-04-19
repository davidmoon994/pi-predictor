'use client';
import React, { useEffect, useState } from 'react';
import CardItem from './CardItem';

interface CurrentCardProps {
  issueId: string;
  lockedPrice: number;
  lastPrice: number;
  priceChange: number;
  prizePool: number;
  upPayout: number;
  downPayout: number;
}

export default function CurrentCard(props: CurrentCardProps) {
  const [progress, setProgress] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 300) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setShowEasterEgg(true);
          setTimeout(() => setShowEasterEgg(false), 10000);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <CardItem
      issueId={props.issueId}
      status="live"
      lastPrice={props.lastPrice}
      lockedPrice={props.lockedPrice}
      priceChange={props.priceChange}
      prizePool={props.prizePool}
      upPayout={props.upPayout}
      downPayout={props.downPayout}
      progress={(progress / 300) * 100}
      showEasterEgg={showEasterEgg}
    />
  );
}
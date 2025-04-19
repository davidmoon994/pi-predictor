// app/components/PastCard.tsx
'use client';
import React from 'react';
import CardItem from './CardItem';

interface PastCardProps {
  issueId: string;
  lastPrice: number;
  lockedPrice: number;
  priceChange: number;
  prizePool: number;
  upPayout: number;
  downPayout: number;
}

export default function PastCard(props: PastCardProps) {
  return (
    <CardItem
      issueId={props.issueId}
      status="past"
      lastPrice={props.lastPrice}
      lockedPrice={props.lockedPrice}
      priceChange={props.priceChange}
      prizePool={props.prizePool}
      upPayout={props.upPayout}
      downPayout={props.downPayout}
    />
  );
}
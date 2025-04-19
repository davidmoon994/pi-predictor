'use client';
import React from 'react';
import CardItem from './CardItem';

interface UpcomingCardProps {
  issueId: string;
  lockedPrice: number;
  lastPrice: number;
  priceChange: number;
  prizePool: number;
  upPayout: number;
  downPayout: number;
}

export default function UpcomingCard(props: UpcomingCardProps) {
  return (
    <CardItem
      issueId={props.issueId}
      status="upcoming"
      lastPrice={props.lastPrice}
      lockedPrice={props.lockedPrice}
      priceChange={props.priceChange}
      prizePool={props.prizePool}
      upPayout={props.upPayout}
      downPayout={props.downPayout}
    />
  );
}
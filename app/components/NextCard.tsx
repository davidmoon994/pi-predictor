'use client';
import React from 'react';
import CardItem from './CardItem';

interface NextCardProps {
  issueId: string;
  lockedPrice: number;
  lastPrice: number;
  priceChange: number;
  prizePool: number;
  upPayout: number;
  downPayout: number;
}

export default function NextCard(props: NextCardProps) {
  return (
    <CardItem
      issueId={props.issueId}
      status="next"
      lastPrice={props.lastPrice}
      lockedPrice={props.lockedPrice}
      priceChange={props.priceChange}
      prizePool={props.prizePool}
      upPayout={props.upPayout}
      downPayout={props.downPayout}
    />
  );
}
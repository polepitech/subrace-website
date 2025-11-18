'use client';

import { useState } from 'react';
import PodiumSection from './PodiumSection';
import RankingListSection from './RankingListSection';

interface Follower {
  username: string;
  img: string;
  point: number;
}

interface LeaderboardContainerProps {
  ranking: Follower[];
  className?: string;
  hasIncompleteData?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function LeaderboardContainer({ 
  ranking, 
  className = '', 
  hasIncompleteData = false, 
  loading = false,
  onLoadMore,
  hasMore = false
}: LeaderboardContainerProps) {
  const topThree = ranking.slice(0, 3);
  const rest = ranking.slice(3); // Affiche tout le reste (plus de slice local)
  const maxPoints = ranking[0]?.point || 1;

  return (
    <div className={`relative z-10 md:flex md:gap-8 md:px-8 lg:px-12 md:mt-8 flex-1 min-h-0 mb-20 ${className}`}>
      <PodiumSection topThree={topThree} />
      <RankingListSection 
        ranking={rest} 
        maxPoints={maxPoints}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        hasIncompleteData={hasIncompleteData}
      />
    </div>
  );
}


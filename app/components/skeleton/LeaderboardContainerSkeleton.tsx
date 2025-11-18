import PodiumSectionSkeleton from './PodiumSectionSkeleton';
import RankingListSectionSkeleton from './RankingListSectionSkeleton';

interface LeaderboardContainerSkeletonProps {
  className?: string;
}

export default function LeaderboardContainerSkeleton({ className = '' }: LeaderboardContainerSkeletonProps) {
  return (
    <div className={`relative z-10 md:flex md:gap-8 md:px-8 lg:px-12 md:mt-8 flex-1 min-h-0 ${className}`}>
      <PodiumSectionSkeleton />
      <RankingListSectionSkeleton itemCount={8} />
    </div>
  );
}


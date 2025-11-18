interface RankingListItemSkeletonProps {
  className?: string;
}

export default function RankingListItemSkeleton({ className = '' }: RankingListItemSkeletonProps) {
  return (
    <li className={`flex items-center gap-3 md:gap-4 py-2 md:py-3 ${className}`}>
      <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full animate-pulse"></div>
      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full animate-pulse"></div>
      <div className="min-w-0 flex-1">
        <div className="h-5 md:h-6 w-24 md:w-32 bg-white/10 rounded animate-pulse mb-2"></div>
        <div className="h-2 w-full bg-white/10 rounded animate-pulse"></div>
      </div>
      <div className="ml-auto h-6 w-12 md:w-16 bg-white/10 rounded animate-pulse"></div>
    </li>
  );
}


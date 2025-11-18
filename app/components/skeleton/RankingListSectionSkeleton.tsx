import RankingListItemSkeleton from './RankingListItemSkeleton';

interface RankingListSectionSkeletonProps {
  className?: string;
  itemCount?: number;
}

export default function RankingListSectionSkeleton({ className = '', itemCount = 8 }: RankingListSectionSkeletonProps) {
  return (
    <section className={`relative z-10 mt-5 md:mt-0 px-4 md:px-0 md:flex-1 md:max-w-lg lg:max-w-xl flex flex-col ${className}`}>
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-2 md:p-4 flex-1 min-h-0 overflow-hidden flex flex-col">
        <ul className="divide-y divide-white/5 overflow-y-auto no-scrollbar pr-1 flex-1">
          {Array.from({ length: itemCount }).map((_, idx) => (
            <RankingListItemSkeleton key={idx} />
          ))}
        </ul>
      </div>
    </section>
  );
}


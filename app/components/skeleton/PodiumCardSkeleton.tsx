interface PodiumCardSkeletonProps {
  className?: string;
}

export default function PodiumCardSkeleton({ className = '' }: PodiumCardSkeletonProps) {
  return (
    <div className={`flex flex-col items-center text-center shrink-0 md:flex-row md:items-center md:justify-start md:text-left md:gap-4 ${className}`}>
      <div className="relative rounded-2xl p-3 md:p-4 bg-white/5 backdrop-blur-sm transition flex flex-col md:flex-row items-center md:items-center md:justify-start md:gap-4 w-full">
        <div className="absolute -top-0 -right-3 md:relative md:top-0 md:right-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full animate-pulse"></div>
        </div>
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="md:flex-1 w-full">
          <div className="mt-2 md:mt-0 h-5 md:h-6 w-24 md:w-32 bg-white/10 rounded animate-pulse"></div>
          <div className="mt-2 h-6 md:h-7 w-16 md:w-20 bg-white/10 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}


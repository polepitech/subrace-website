interface HeaderSkeletonProps {
  className?: string;
}

export default function HeaderSkeleton({ className = '' }: HeaderSkeletonProps) {
  return (
    <header className={`relative z-10 px-6 md:px-8 lg:px-12 pt-10 md:pt-12 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 md:w-40 bg-white/10 rounded animate-pulse"></div>
        <div className="h-10 w-40 md:w-48 lg:w-56 bg-white/10 rounded animate-pulse"></div>
      </div>
      <div className="mt-2 h-10 md:h-12 lg:h-14 w-48 md:w-64 bg-white/10 rounded animate-pulse"></div>
    </header>
  );
}


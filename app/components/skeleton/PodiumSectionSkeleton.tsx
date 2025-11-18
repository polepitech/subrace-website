import PodiumCardSkeleton from './PodiumCardSkeleton';

interface PodiumSectionSkeletonProps {
  className?: string;
}

export default function PodiumSectionSkeleton({ className = '' }: PodiumSectionSkeletonProps) {
  return (
    <section className={`relative z-10 mt-5 md:mt-0 px-4 md:px-0 md:flex-1 md:max-w-md ${className}`}>
      <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:gap-4">
        <PodiumCardSkeleton />
        <PodiumCardSkeleton />
        <PodiumCardSkeleton />
      </div>
    </section>
  );
}


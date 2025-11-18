interface PositionBadgeProps {
  position: number;
  className?: string;
}

export default function PositionBadge({ position, className = '' }: PositionBadgeProps) {
  return (
    <div className={`flex h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg bg-white/5 text-sm md:text-base lg:text-lg font-bold text-white ${className}`}>
      {position}
    </div>
  );
}


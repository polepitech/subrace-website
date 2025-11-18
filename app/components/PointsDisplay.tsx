interface PointsDisplayProps {
  points: number;
  variant?: 'default' | 'large';
  className?: string;
}

export default function PointsDisplay({ points, variant = 'default', className = '' }: PointsDisplayProps) {
  const textSize = variant === 'large' 
    ? 'text-[15px] md:text-base lg:text-lg' 
    : 'text-sm md:text-base lg:text-lg';
  
  const color = variant === 'large'
    ? 'text-neutral-300'
    : 'text-white/90';

  return (
    <div className={`${textSize} ${color} ${className}`}>
      {points} pts
    </div>
  );
}


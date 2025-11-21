'use client';

import { usePathname } from 'next/navigation';

interface PointsDisplayProps {
  points: number;
  variant?: 'default' | 'large';
  className?: string;
}

export default function PointsDisplay({ points, variant = 'default', className = '' }: PointsDisplayProps) {
  const pathname = usePathname();
  const isRacePage = pathname?.startsWith('/races/');
  
  const textSize = variant === 'large' 
    ? 'text-[15px] md:text-base lg:text-lg' 
    : 'text-sm md:text-base lg:text-lg';
  
  const color = variant === 'large'
    ? 'text-neutral-300'
    : 'text-white/90';

  // Formate les points avec des espaces (ex: 1 000 au lieu de 1000)
  const formattedPoints = points.toLocaleString('fr-FR');
  const prefix = isRacePage ? '+' : '';

  return (
    <div className={`${textSize} ${color} ${className}`}>
      {prefix}{formattedPoints} pts
    </div>
  );
}


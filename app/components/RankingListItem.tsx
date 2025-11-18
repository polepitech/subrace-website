import Link from 'next/link';
import Avatar from './Avatar';
import PositionBadge from './PositionBadge';
import ProgressBar from './ProgressBar';
import PointsDisplay from './PointsDisplay';

interface RankingListItemProps {
  username: string;
  img: string;
  points: number;
  position: number;
  maxPoints: number;
  className?: string;
}

export default function RankingListItem({ 
  username, 
  img, 
  points, 
  position, 
  maxPoints,
  className = '' 
}: RankingListItemProps) {
  return (
    <li className={`flex items-center gap-3 md:gap-4 py-2 md:py-3 ${className}`}>
      <PositionBadge position={position} />
      <Avatar src={img} alt={username} size="sm" />
      <div className="min-w-0 flex-1">
        <Link
          href={`/users/${encodeURIComponent(username)}`}
          className="truncate text-sm md:text-base lg:text-lg text-white hover:text-blue-400 transition-colors cursor-pointer block"
        >
          {username}
        </Link>
        <ProgressBar value={points} max={maxPoints} />
      </div>
      <span className="ml-auto">
        <PointsDisplay points={points} variant="default" className="font-semibold" />
      </span>
    </li>
  );
}


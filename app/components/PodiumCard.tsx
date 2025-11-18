import Link from 'next/link';
import Avatar from './Avatar';
import MedalIcon from './MedalIcon';
import PointsDisplay from './PointsDisplay';

interface PodiumCardProps {
  username: string;
  img: string;
  points: number;
  position: number; // 1, 2, or 3
  className?: string;
}

export default function PodiumCard({ username, img, points, position, className = '' }: PodiumCardProps) {
  const ringClasses = {
    1: 'ring-2 ring-red-500 shadow-[0_0_40px_-10px_rgba(34,211,238,0.9)]',
    2: 'ring-2 ring-green-300 shadow-[0_0_40px_-10px_rgba(167,139,250,0.9)]',
    3: 'ring-2 ring-white shadow-[0_0_40px_-10px_rgba(251,191,36,0.9)]'
  };

  return (
    <div className={`flex flex-col items-center text-center shrink-0 md:flex-row md:items-center md:justify-start md:text-left md:gap-4 ${className}`}>
      <div className="relative rounded-2xl p-3 md:p-4 bg-white/5 backdrop-blur-sm transition flex flex-col md:flex-row items-center md:items-center md:justify-start md:gap-4 w-full">
        <div className="absolute -top-0 -right-3 md:relative md:top-0 md:right-0">
          <MedalIcon position={position} />
        </div>
        <Avatar src={img} alt={username} size="md" ring={ringClasses[position as keyof typeof ringClasses]} />
        <div className="md:flex-1">
          <Link 
            href={`/users/${encodeURIComponent(username)}`}
            className="mt-2 md:mt-0 text-sm md:text-base lg:text-lg font-medium w-25 overflow-hidden text-white line-clamp-1 hover:text-blue-400 transition-colors cursor-pointer block"
          >
            {username}
          </Link>
          <PointsDisplay points={points} variant="large" />
        </div>
      </div>
    </div>
  );
}


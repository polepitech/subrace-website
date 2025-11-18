import PodiumCard from './PodiumCard';

interface Follower {
  username: string;
  img: string;
  point: number;
}

interface PodiumSectionProps {
  topThree: Follower[];
  className?: string;
}

export default function PodiumSection({ topThree, className = '' }: PodiumSectionProps) {
  return (
    <section className={`relative z-10 mt-5 md:mt-0 px-4 md:px-0 md:flex-1 md:max-w-md ${className}`}>
      <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:gap-4">
        {topThree.map((follower, index) => (
          <PodiumCard
            key={follower.username}
            username={follower.username}
            img={follower.img}
            points={follower.point}
            position={index + 1}
          />
        ))}
      </div>
    </section>
  );
}


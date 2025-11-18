interface MedalIconProps {
  position: number;
  className?: string;
}

export default function MedalIcon({ position, className = '' }: MedalIconProps) {
  const medals = ['🥇', '🥈', '🥉'];
  const medal = medals[position - 1] || '';

  if (!medal) return null;

  return (
    <div className={`text-5xl md:text-4xl ${className}`}>
      {medal}
    </div>
  );
}


interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export default function ProgressBar({ value, max, className = '' }: ProgressBarProps) {
  const percentage = Math.min(100, (value / Math.max(1, max)) * 100);

  return (
    <div className={`mt-1 md:mt-2 h-1.5 md:h-2 w-28 md:w-full rounded bg-white/10 ${className}`}>
      <div
        className="h-1.5 md:h-2 rounded bg-white/70"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}


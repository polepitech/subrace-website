interface HeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function Header({ 
  title = 'PODIUM', 
  subtitle = 'Daily Leaderboard',
  className = '' 
}: HeaderProps) {
  return (
    <header className={`relative z-10 px-6 md:px-8 lg:px-12 pt-10 md:pt-12 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs md:text-sm lg:text-base uppercase tracking-[0.2em] text-neutral-300">
          {subtitle}
        </div>
        <div className="text-xs absolute text-neutral-400  top-0 right-0 md:right-4 lg:right-8">
          <img src='/logo_V2.png' className='w-40 md:w-48 lg:w-56 relative z-[-1]' alt="Logo" />
        </div>
      </div>
      <h1 className="mt-2 text-xl md:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase drop-shadow-lg">
        {title}
      </h1>
    </header>
  );
}


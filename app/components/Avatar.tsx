import Link from "next/link";

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ring?: string;
  noLink?: boolean;
}

export default function Avatar({ src, alt, size = 'md', className = '', ring = '', noLink = false }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-7 w-7 md:h-10 md:w-10 lg:h-12 lg:w-12',
    md: 'h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24',
    lg: 'h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28'
  };

  if(noLink) {
    return (
      <div className={`relative ${className}`}>
        <img src={src} alt={alt} className={`${sizeClasses[size]} rounded-full object-cover ${ring}`} />
        <img
          src="/glass.png"
          alt=""
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full object-cover mix-blend-screen pointer-events-none`}
        />
      </div>
    );
  }

  return (
    <Link href={`/users/${encodeURIComponent(alt)}`} className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${ring}`}
      />
      <img
        src="/glass.png"
        alt=""
        className={`absolute inset-0 ${sizeClasses[size]} rounded-full object-cover mix-blend-screen pointer-events-none`}
      />
    </Link>
  );
}


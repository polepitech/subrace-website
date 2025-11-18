'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Avatar from './Avatar';

interface Follower {
  username: string;
  img: string;
  point: number;
}

interface SearchBarProps {
  followers: Follower[];
  className?: string;
}

export default function SearchBar({ followers, className = '' }: SearchBarProps) {
  const t = useTranslations('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredFollowers, setFilteredFollowers] = useState<Follower[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFollowers([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = followers
      .filter(follower => 
        follower.username.toLowerCase().includes(query)
      )
      .slice(0, 10); // Limite à 10 résultats

    setFilteredFollowers(filtered);
    setIsOpen(filtered.length > 0);
  }, [searchQuery, followers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (username: string) => {
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative z-50 ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (filteredFollowers.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={t('placeholder')}
          className="w-full px-4 py-2 pl-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && filteredFollowers.length > 0 && (
        <div className="absolute z-[9999] w-full mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg overflow-hidden">
          <ul className="max-h-96 overflow-y-auto">
            {filteredFollowers.map((follower) => (
              <li key={follower.username}>
                <Link
                  href={`/users/${encodeURIComponent(follower.username)}`}
                  onClick={() => handleSelect(follower.username)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <Avatar noLink={true} src={follower.img} alt={follower.username} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {follower.username}
                    </div>
                    <div className="text-sm text-neutral-300">
                      {follower.point.toLocaleString()} pts
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


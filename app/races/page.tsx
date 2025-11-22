'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import { generateRaceNameWithPrefix } from '../utils/generateRaceName';

interface Race {
  id: number;
  day: string;
  type?: string;
  date?: string;
  winner?: string;
  second?: string;
  third?: string;
  [key: string]: any;
}

export default function RacesPage() {
  const t = useTranslations();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch('/api/races');
        const data = await response.json();
        setRaces(data);
      } catch (error) {
        console.error('Error fetching races:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-900">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-white text-xl">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <Navbar />
      <div className="flex-1 p-3 sm:p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">
            {t('races.title')}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {races.map((race) => (
              <Link
                key={race.id}
                href={`/races/${race.id}`}
                className="block rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm p-4 sm:p-6 hover:bg-white/10 transition-colors"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                  {generateRaceNameWithPrefix(race, t)}
                </h2>

                
                  
                {/* Podium horizontal avec médailles */}
                <div className="flex items-end justify-around gap-1 sm:gap-2 md:gap-4">
                  {/* 1ère place (plus haute) */}
                  {race.winner && (
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Avatar 
                        src={`/api/images/avatars/${race.winner.toLowerCase()}.jpg`} 
                        alt={race.winner} 
                        size="md"
                        className="mb-1"
                        noLink={true}
                      />
                      <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-neutral-300 text-center truncate w-full px-1">
                        🥇 {race.winner}
                      </p>
                    </div>
                  )}
                  {/* 2ème place */}
                  {race.second && (
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Avatar 
                        src={`/api/images/avatars/${race.second.toLowerCase()}.jpg`} 
                        alt={race.second} 
                        size="md"
                        className="mb-1"
                        noLink={true}
                      />
                      <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-neutral-300 text-center truncate w-full px-1">
                        🥈 {race.second}
                      </p>
                    </div>
                  )}
                  
                  {/* 3ème place */}
                  {race.third && (
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Avatar 
                        src={`/api/images/avatars/${race.third.toLowerCase()}.jpg`} 
                        alt={race.third} 
                        size="md"
                        className="mb-1"
                        noLink={true}
                      />
                      <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-neutral-300 text-center truncate w-full px-1">
                        🥉 {race.third}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Header from '../../components/Header';
import BackgroundEffects from '../../components/BackgroundEffects';
import Navbar from '../../components/Navbar';
import Avatar from '../../components/Avatar';
import { calculatePoints } from '../../utils/calculatePoints';
import { generateRaceNameWithPrefix } from '../../utils/generateRaceName';

interface RaceResult {
  race_id: number;
  position: number;
  race_id_full: number;
  race_day?: string | number | null;
  race_type?: string | null;
}

interface UserStats {
  follower: {
    id: number;
    username: string;
    img: string;
  };
  stats: {
    totalRaces: number;
    totalPoints: number;
    podiums: number;
    victories: number;
    bestPosition: number | null;
    averagePosition: number | null;
    globalRank: number | null;
  };
  races: RaceResult[];
}

export default function UserStatsPage() {
  const t = useTranslations();
  const params = useParams();
  const username = params?.username as string;
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchUserStats = async () => {
      try {
        const response = await fetch(`/api/users/${encodeURIComponent(username)}`);
        const userData = await response.json();

        if (userData.error) {
          console.error('Error:', userData.error);
          setLoading(false);
          return;
        }

        setData(userData);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [username]);

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

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-900">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-white text-xl">{t('user.notFound')}</div>
        </div>
      </div>
    );
  }

  const { follower, stats, races } = data;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <Navbar />
      <div className="flex items-center justify-center flex-1 p-4 md:p-8">
        <div className="podium relative w-full min-h-screen aspect-[9/16] md:aspect-auto md:min-h-[600px] overflow-y-auto md:overflow-hidden rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]">
          <BackgroundEffects />
          <Header title={follower.username.toUpperCase()} subtitle={t('user.title')} />

          <div className="relative z-10 px-6 md:px-8 lg:px-12 mt-8">
            {/* Profil utilisateur */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              <Avatar src={follower.img} alt={follower.username} size="lg" />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {follower.username}
                </h2>
                
                {/* Stats principales */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-neutral-400 text-sm mb-1">{t('user.stats.globalRank')}</div>
                    <div className="text-2xl font-bold text-white">
                      {stats.globalRank ? `#${stats.globalRank}` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-neutral-400 text-sm mb-1">{t('user.stats.totalRaces')}</div>
                    <div className="text-2xl font-bold text-white">{stats.totalRaces}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-neutral-400 text-sm mb-1">{t('user.stats.totalPoints')}</div>
                    <div className="text-2xl font-bold text-white">{stats.totalPoints.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-neutral-400 text-sm mb-1">{t('user.stats.podiums')}</div>
                    <div className="text-2xl font-bold text-white">{stats.podiums}</div>
                  </div>
                </div>

                {/* Stats secondaires */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-neutral-400 text-sm mb-1">{t('user.stats.bestPosition')}</div>
                    <div className="text-xl font-bold text-white">
                      {stats.bestPosition ? `#${stats.bestPosition}` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-neutral-400 text-sm mb-1">{t('user.stats.averagePosition')}</div>
                    <div className="text-xl font-bold text-white">
                      {stats.averagePosition ? `#${stats.averagePosition}` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des courses */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 max-h-[400px] md:max-h-[500px] overflow-y-auto mb-6">
              <h3 className="text-xl font-bold text-white mb-4">{t('user.raceHistory')}</h3>
              {races.length === 0 ? (
                <div className="text-neutral-400 text-center py-8">{t('user.noRaces')}</div>
              ) : (
                <div className="space-y-2">
                  {races.map((race) => {
                    const points = calculatePoints(race.position);
                    const medal = race.position === 1 ? '🥇' : race.position === 2 ? '🥈' : race.position === 3 ? '🥉' : null;
                    
                    return (
                      <Link
                        key={race.race_id}
                        href={`/races/${race.race_id}`}
                        className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {medal && <span className="text-2xl">{medal}</span>}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              {generateRaceNameWithPrefix({ 
                                id: race.race_id_full, 
                                day: race.race_day, 
                                type: race.race_type 
                              }, t)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-white font-semibold">{t('user.position')} #{race.position}</div>
                            <div className="text-sm text-neutral-300">{points} {t('user.points')}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Message informatif */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 mb-20">
              <div className="space-y-3 text-sm md:text-base text-neutral-300">
                <p>
                  <span className="font-semibold text-white">{t('user.info.title')}</span>
                </p>
                <p>
                  {t('user.info.limit', { limit: '40 000' })}
                </p>
                <p>
                  {t('user.info.apology')}
                </p>
                <p>
                  {t.rich('user.info.support', {
                    link: (chunks) => (
                      <a 
                        href={"https://buymeacoffee.com/subtorace4"}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline font-semibold transition-colors"
                      >
                        {chunks}
                      </a>
                    )
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


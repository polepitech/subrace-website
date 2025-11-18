'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Header from '../../components/Header';
import HeaderSkeleton from '../../components/skeleton/HeaderSkeleton';
import BackgroundEffects from '../../components/BackgroundEffects';
import LeaderboardContainer from '../../components/LeaderboardContainer';
import LeaderboardContainerSkeleton from '../../components/skeleton/LeaderboardContainerSkeleton';
import Navbar from '../../components/Navbar';
import { calculatePoints } from '../../utils/calculatePoints';
import Head from 'next/head';

interface Follower {
  username: string;
  img: string;
  point: number;
}

export default function RacePage() {
  const t = useTranslations();
  const params = useParams();
  const raceId = params?.id as string;
  const [ranking, setRanking] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [raceName, setRaceName] = useState<string>('');
  const [hasIncompleteData, setHasIncompleteData] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [followersMap, setFollowersMap] = useState<{ [key: string]: Follower }>({});
  const [totalPositions, setTotalPositions] = useState<number | null>(null);

  // Charge les followers une seule fois au montage
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const followersResponse = await fetch('/api/users');
        const followers = await followersResponse.json();
        
        const map: { [key: string]: Follower } = {};
        followers.forEach((follower: any) => {
          map[follower.username] = {
            username: follower.username,
            img: `/api/images/avatars/${follower.username.toLowerCase()}.jpg`,
            point: 0,
          };
        });
        setFollowersMap(map);
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    };
    fetchFollowers();
  }, []);

  // Charge les données de la course
  useEffect(() => {
    if (!raceId || Object.keys(followersMap).length === 0) return;

    const fetchRaceData = async () => {
      try {
        const response = await fetch(`/api/races/${raceId}?offset=0&limit=25`);
        const raceData = await response.json();

        if (raceData.error) {
          console.error('Error:', raceData.error);
          setLoading(false);
          return;
        }

        setRaceName(raceData.day || `Course #${raceId}`);
        setTotalPositions(raceData.total || null);

        // Vérifie si on a des positions complètes ou seulement le podium
        const hasPositions = raceData.positions && Array.isArray(raceData.positions) && raceData.positions.length > 0;
        const hasPodiumOnly = (raceData.winner || raceData.second || raceData.third) && !hasPositions;

        if (hasPodiumOnly) {
          setHasIncompleteData(true);
          // Construit le podium à partir de winner, second, third
          const podium: Follower[] = [];
          
          if (raceData.winner && followersMap[raceData.winner]) {
            podium.push({
              ...followersMap[raceData.winner],
              point: calculatePoints(1)
            });
          }
          if (raceData.second && followersMap[raceData.second]) {
            podium.push({
              ...followersMap[raceData.second],
              point: calculatePoints(2)
            });
          }
          if (raceData.third && followersMap[raceData.third]) {
            podium.push({
              ...followersMap[raceData.third],
              point: calculatePoints(3)
            });
          }
          
          setRanking(podium);
          setHasMore(false);
        } else if (hasPositions) {
          // Calcule les points pour chaque position de cette course
          const positionsWithPoints = raceData.positions.map((position: any) => {
            const follower = followersMap[position.username];
            if (follower) {
              return {
                ...follower,
                point: calculatePoints(position.position),
                position: position.position
              };
            }
            return null;
          }).filter((f: Follower | null) => f !== null) as Follower[];

          // Trie par position
          const sorted = positionsWithPoints.sort((a, b) => {
            const aPos = raceData.positions.find((p: any) => p.username === a.username)?.position || 999999;
            const bPos = raceData.positions.find((p: any) => p.username === b.username)?.position || 999999;
            return aPos - bPos;
          });

          setRanking(sorted);
          setHasMore(raceData.hasMore);
          setCurrentOffset(25);
        } else {
          setRanking([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching race data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaceData();
  }, [raceId, followersMap]);

  // Fonction pour charger plus de positions
  const loadMore = async () => {
    if (!hasMore || hasIncompleteData) return;

    try {
      const response = await fetch(`/api/races/${raceId}?offset=${currentOffset}&limit=25`);
      const raceData = await response.json();

      if (raceData.positions && raceData.positions.length > 0) {
        // Calcule les points pour chaque nouvelle position
        const newPositions = raceData.positions.map((position: any) => {
          const follower = followersMap[position.username];
          if (follower) {
            return {
              ...follower,
              point: calculatePoints(position.position),
              position: position.position
            };
          }
          return null;
        }).filter((f: Follower | null) => f !== null) as Follower[];

        // Trie par position et ajoute aux résultats existants
        const sorted = newPositions.sort((a, b) => {
          const aPos = raceData.positions.find((p: any) => p.username === a.username)?.position || 999999;
          const bPos = raceData.positions.find((p: any) => p.username === b.username)?.position || 999999;
          return aPos - bPos;
        });

        setRanking(prev => [...prev, ...sorted]);
        setHasMore(raceData.hasMore);
        setCurrentOffset(prev => prev + 25);
      }
    } catch (error) {
      console.error('Error loading more positions:', error);
    }
  };

  if (loading ) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-900">
        <Navbar />
        <div className="flex items-center justify-center flex-1 p-4 md:p-8">
          <div className="podium relative w-full min-h-screen aspect-[9/16] md:aspect-auto md:min-h-[600px] overflow-y-auto md:overflow-hidden rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]">
            <BackgroundEffects />
            <Header title={raceName || ''} subtitle={t('races.results')} />
            <LeaderboardContainerSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-900">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-white text-xl">{t('races.noData')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <Navbar />
      <div className="flex items-center justify-center flex-1 p-4 md:p-8">
        <div className="podium relative w-full min-h-screen aspect-[9/16] md:aspect-auto md:min-h-[600px] overflow-y-auto md:overflow-hidden rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]">
          <BackgroundEffects />
          <Header title={raceName} subtitle={t('races.results')} />
          {totalPositions !== null && (
            <div className="relative z-10 px-6 md:px-8 lg:px-12 mt-2">
              <div className="text-sm md:text-base text-neutral-400">
                {totalPositions.toLocaleString('fr-FR')} {t('races.storedData')}
              </div>
            </div>
          )}
          <LeaderboardContainer 
            loading={loading} 
            ranking={ranking} 
            hasIncompleteData={hasIncompleteData}
            onLoadMore={loadMore}
            hasMore={hasMore}
          />
        </div>
      </div>
    </div>
  );
}


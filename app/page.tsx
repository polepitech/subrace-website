'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from './components/Header';
import BackgroundEffects from './components/BackgroundEffects';
import LeaderboardContainer from './components/LeaderboardContainer';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import HeaderSkeleton from './components/skeleton/HeaderSkeleton';
import LeaderboardContainerSkeleton from './components/skeleton/LeaderboardContainerSkeleton';

interface Follower {
  username: string;
  img: string;
  point: number;
}

export default function HomePage() {
  const t = useTranslations('home');
  const [ranking, setRanking] = useState<Follower[]>([]);
  const [allUsers, setAllUsers] = useState<Follower[]>([]); // Pour SearchBar
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Charge la première page au montage
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Charge la première page du leaderboard
        const leaderboardResponse = await fetch('/api/leaderboard?page=0&limit=25');
        const leaderboardData = await leaderboardResponse.json();
        
        setRanking(leaderboardData.users);
        setHasMore(leaderboardData.hasMore);
        setCurrentPage(0);

        // Charge tous les utilisateurs pour la recherche (sans pagination = tous les utilisateurs)
        const searchResponse = await fetch('/api/search');
        const searchUsers = await searchResponse.json();
        // Si pas de pagination, l'API retourne directement un tableau
        // Sinon, c'est un objet { users, total, page, limit, hasMore }
        setAllUsers(Array.isArray(searchUsers) ? searchUsers : (searchUsers.users || []));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fonction pour charger plus de données
  const loadMore = async () => {
    if (!hasMore) return;

    try {
      const nextPage = currentPage + 1;
      const response = await fetch(`/api/leaderboard?page=${nextPage}&limit=25`);
      const data = await response.json();
      
      setRanking(prev => [...prev, ...data.users]);
      setHasMore(data.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-900">
        <Navbar />
        <div className="flex items-center justify-center flex-1 p-4 md:p-8">
          <div className="podium relative w-full min-h-screen aspect-[9/16] md:aspect-auto md:min-h-[600px] overflow-y-auto md:overflow-hidden rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]">
            <BackgroundEffects />
            <Header />
            <LeaderboardContainerSkeleton />
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <Navbar />
      <div className="relative z-[100] px-6 md:px-8 lg:px-12 mt-4">
        <SearchBar followers={allUsers} />
      </div>
      <div className="flex items-center justify-center flex-1 p-4 md:p-8">
        <div className="podium relative w-full min-h-screen aspect-[9/16] md:aspect-auto md:min-h-[600px] overflow-y-auto md:overflow-hidden rounded-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] flex flex-col">
          <BackgroundEffects />
          <Header title={t('title')} subtitle={t('subtitle')} />
          <LeaderboardContainer ranking={ranking} onLoadMore={loadMore} hasMore={hasMore} />
        </div>
      </div>
    </div>
  );
}


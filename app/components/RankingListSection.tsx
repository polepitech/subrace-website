'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import RankingListItem from './RankingListItem';

interface Follower {
  username: string;
  img: string;
  point: number;
}

interface RankingListSectionProps {
  ranking: Follower[];
  startPosition?: number;
  maxPoints: number;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  hasIncompleteData?: boolean;
}

export default function RankingListSection({ 
  ranking, 
  startPosition = 4,
  maxPoints,
  className = '',
  onLoadMore,
  hasMore = false,
  hasIncompleteData = false
}: RankingListSectionProps) {
  const t = useTranslations('leaderboard');
  const scrollContainerRef = useRef<HTMLUListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    // Trouve le conteneur .podium parent (celui qui scroll sur mobile)
    const findPodiumContainer = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null;
      if (element.classList.contains('podium')) return element;
      return findPodiumContainer(element.parentElement);
    };

    const podiumContainer = findPodiumContainer(sectionRef.current);
    
    // Sur mobile, le scroll se fait dans .podium, sur desktop dans window
    const isMobile = window.innerWidth < 768; // md breakpoint
    const scrollTarget = isMobile && podiumContainer ? podiumContainer : window;

    const handleScroll = () => {
      if (loadingRef.current) return;

      let scrollHeight: number;
      let scrollTop: number;
      let clientHeight: number;
      let distanceFromBottom: number;

      if (isMobile && podiumContainer) {
        // Scroll dans le conteneur .podium
        scrollHeight = podiumContainer.scrollHeight;
        scrollTop = podiumContainer.scrollTop;
        clientHeight = podiumContainer.clientHeight;
        distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      } else {
        // Scroll dans window
        scrollHeight = document.documentElement.scrollHeight;
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        clientHeight = window.innerHeight;
        distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      }

      // Si on est à moins de 300px du bas, on charge plus
      if (distanceFromBottom < 300) {
        loadingRef.current = true;
        onLoadMore();
        // Réinitialise le flag après un court délai pour éviter les appels multiples
        setTimeout(() => {
          loadingRef.current = false;
        }, 500);
      }
    };

    // Attache l'event listener sur le bon élément
    if (isMobile && podiumContainer) {
      podiumContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        podiumContainer.removeEventListener('scroll', handleScroll);
      };
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [onLoadMore, hasMore, ranking.length]);

  return (
    <section ref={sectionRef} className={`relative z-10 mt-5 md:mt-0 px-4 md:px-0 md:flex-1 md:max-w-lg lg:max-w-xl flex flex-col ${className}`}>
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-2 md:p-4 flex-1 min-h-0  flex flex-col">
        <ul 
          ref={scrollContainerRef}
          className="divide-y divide-white/5 overflow-y-auto no-scrollbar pr-1 flex-1"
        >
          {ranking.map((follower, idx) => {
            const position = startPosition + idx;
            return (
              <RankingListItem
                key={follower.username}
                username={follower.username}
                img={follower.img}
                points={follower.point}
                position={position}
                maxPoints={maxPoints}
              />
            );
          })}
          {hasIncompleteData && (
            <li className="py-8 text-center">
              <div className="text-neutral-400 text-sm md:text-base">
                <p className="mb-2">{t('incompleteData')}</p>
                <p className="text-xs md:text-sm text-neutral-500">
                  {t('incompleteDataDescription')}
                </p>
              </div>
            </li>
          )}
          {hasMore && !hasIncompleteData && (
            <li className="py-4 text-center text-neutral-400 text-sm">
              {t('loading')}
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}


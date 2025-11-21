'use client';

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ring?: string;
  noLink?: boolean;
}

export default function Avatar({ src, alt, size = 'md', className = '', ring = '', noLink = false }: AvatarProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();

  const sizeClasses = {
    sm: 'h-7 w-7 md:h-10 md:w-10 lg:h-12 lg:w-12',
    md: 'h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24',
    lg: 'h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28'
  };

  const handleImageError = useCallback(async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    
    // Masquer l'icône d'image cassée en cachant l'image
    setImageError(true);
    
    // Vérifier que nous sommes sur une page utilisateur (/users/[username])
    if (!pathname || !pathname.startsWith('/users/')) {
      return; // Ne pas appeler l'API si on n'est pas sur une page utilisateur
    }
    
    // Vérifier si c'est une erreur 404
    try {
      const response = await fetch(img.src, { method: 'HEAD' });
      if (response.status !== 404) {
        return; // Ce n'est pas un 404, ne rien faire
      }
    } catch (error) {
      // Si la requête échoue, on assume que c'est un 404
    }

    // Éviter les tentatives multiples
    if (hasTriedFetch || isLoading) {
      return;
    }

    // Vérifier localStorage pour limiter les appels à une fois toutes les 30 secondes
    const storageKey = `instagram_avatar_last_fetch_${alt}`;
    const lastFetchTime = localStorage.getItem(storageKey);
    const now = Date.now();
    const thirtySeconds = 30 * 1000;

    if (lastFetchTime) {
      const timeSinceLastFetch = now - parseInt(lastFetchTime, 10);
      if (timeSinceLastFetch < thirtySeconds) {
        // Moins de 30 secondes se sont écoulées, ne pas appeler l'API
        return;
      }
    }

    setIsLoading(true);
    setHasTriedFetch(true);

    try {
      // Appeler l'API pour télécharger depuis Instagram
      const response = await fetch(`/api/fetch-instagram-avatar?username=${encodeURIComponent(alt)}`);
      
      // Mettre à jour le timestamp dans localStorage
      localStorage.setItem(storageKey, now.toString());
      
      if (response.ok) {
        // Réinitialiser l'état d'erreur et recharger l'image avec un timestamp
        setImageError(false);
        const newSrc = `${src.split('?')[0]}?t=${Date.now()}`;
        setImageSrc(newSrc);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch Instagram avatar:', errorText);
        
        // Si c'est une erreur de rate limit (429), ne pas réessayer
        if (response.status === 429) {
          // Mettre à jour le timestamp même en cas d'erreur pour respecter le rate limit
          localStorage.setItem(storageKey, now.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching Instagram avatar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [src, alt, hasTriedFetch, isLoading, pathname]);

  const imgElement = (
    <>
      {/* Loader animé pendant le chargement */}
      {isLoading && (
        <div 
          className={`${sizeClasses[size]} rounded-full bg-black ${ring} relative flex items-center justify-center`}
          aria-hidden="true"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/3 h-1/3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      {/* Placeholder noir quand l'image est en erreur (sans loader) */}
      {imageError && !isLoading && (
        <div 
          className={`${sizeClasses[size]} rounded-full bg-black ${ring}`}
          aria-hidden="true"
        />
      )}
      {/* Image masquée si erreur pour éviter l'icône cassée du navigateur */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${ring} ${imageError ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={() => {
          // Réinitialiser l'état d'erreur quand l'image se charge avec succès
          if (imageError) {
            setImageError(false);
          }
        }}
      />
    </>
  );

  if(noLink) {
    return (
      <div className={`relative ${className}`}>
        {imgElement}
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
      {imgElement}
      <img
        src="/glass.png"
        alt=""
        className={`absolute inset-0 ${sizeClasses[size]} rounded-full object-cover mix-blend-screen pointer-events-none`}
      />
    </Link>
  );
}


'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { locales, type Locale, defaultLocale } from '../../i18n';

const languageNames: Record<Locale, { name: string; flag: string }> = {
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' },
  pt: { name: 'Português', flag: '🇵🇹' },
};

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Récupère la locale depuis localStorage au montage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setCurrentLocale(savedLocale);
    }

    // Ferme le menu si on clique en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (locale: Locale) => {
    setCurrentLocale(locale);
    localStorage.setItem('locale', locale);
    setIsOpen(false);
    
    // Déclenche un événement personnalisé pour mettre à jour la locale
    window.dispatchEvent(new Event('localechange'));
    
    // Recharge la page pour appliquer la nouvelle langue
    // (nécessaire car les composants serveur doivent re-render)
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-colors"
        aria-label="Changer de langue"
        aria-expanded={isOpen}
      >
        <span className="text-xl md:text-2xl">{languageNames[currentLocale].flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-16 bg-neutral-800/95 backdrop-blur-md rounded-lg shadow-lg border border-white/10 overflow-hidden z-[10000]">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full flex items-center justify-center p-3 hover:bg-white/10 transition-colors ${
                  currentLocale === locale
                    ? 'bg-white/10'
                    : ''
                }`}
                title={languageNames[locale].name}
              >
                <span className="text-2xl">{languageNames[locale].flag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


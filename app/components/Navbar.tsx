'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations('navbar');

  return (
    <nav className="relative z-[200] w-full bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 w-full justify-start md:gap-6 text-xl">
            <Link 
              href="/" 
              className={`text-xl md:text-2xl font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('home')}
            </Link>
            <Link 
              href="/races" 
              className={`text-xl md:text-2xl font-medium transition-colors ${
                pathname?.startsWith('/races') 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('races')}
            </Link>
            <Link 
              href="/about" 
              className={`text-xl md:text-2xl font-medium transition-colors ${
                pathname?.startsWith('/about') 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('about')}
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}


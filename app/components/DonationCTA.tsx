'use client';

import { useTranslations } from 'next-intl';

export default function DonationCTA() {
  const t = useTranslations('about');

  return (
    <section className="text-center bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 border border-orange-500/40">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
        {t('cta.title')}
      </h2>
      <p className="text-neutral-200 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
        {t('cta.description')}
      </p>
      <a
        href={t('donation.link')}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base sm:text-lg md:text-xl px-8 sm:px-12 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl transition-all transform hover:scale-110 shadow-2xl hover:shadow-orange-500/50"
      >
        {t('cta.button')} 🚀
      </a>
    </section>
  );
}


'use client';

import { useTranslations } from 'next-intl';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import DonationCTA from '../components/DonationCTA';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <Navbar />
      <div className="flex-1 px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4">
              {t('title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-300 max-w-2xl mx-auto px-2">
              {t('subtitle')}
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6 sm:space-y-8 md:space-y-12">
            {/* Project Description */}
            <section className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                {t('description.title')}
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4">
                {t('description.text1')}
              </p>
              <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed">
                {t('description.text2')}
              </p>
            </section>

            {/* Independent Project & Costs */}
            <section className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-orange-500/30">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">💸</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                    {t('costs.title')}
                  </h2>
                  <p className="text-neutral-200 text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4">
                    {t('costs.text1')}
                  </p>
                  <p className="text-neutral-200 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                    {t('costs.text2')}
                  </p>
                  
                  {/* Call to Action - Donation */}
                  <div className="bg-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/20">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">
                      {t('donation.title')}
                    </h3>
                    <p className="text-neutral-200 text-sm sm:text-base mb-4 sm:mb-6">
                      {t('donation.description')}
                    </p>
                    <a
                      href={"https://buymeacoffee.com/subtorace4"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full sm:w-auto text-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {t('donation.button')}
                    </a>
                  </div>
                </div>
              </div>
            </section>

        
          </div>
        </div>
      </div>
    </div>
  );
}


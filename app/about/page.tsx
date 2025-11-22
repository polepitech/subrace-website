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

            {/* Contact Section */}
            <section className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
                {t('contact.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Instagram */}
                <a
                  href={"https://www.instagram.com/subrace_/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 sm:p-6 bg-white/5 hover:bg-white/10 rounded-lg sm:rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f09433" />
                          <stop offset="25%" stopColor="#e6683c" />
                          <stop offset="50%" stopColor="#dc2743" />
                          <stop offset="75%" stopColor="#cc2366" />
                          <stop offset="100%" stopColor="#bc1888" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                        fill="url(#instagram-gradient)"
                        className="group-hover:opacity-80 transition-opacity"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                      {t('contact.instagram.title')}
                    </h3>
                    {/* <p className="text-sm sm:text-base text-neutral-300 truncate">
                      {t('contact.instagram.description')}
                    </p> */}
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:sub.to.race@gmail.com"
                  className="flex items-center gap-4 p-4 sm:p-6 bg-white/5 hover:bg-white/10 rounded-lg sm:rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex-shrink-0">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-400 group-hover:text-blue-300 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                      {t('contact.email.title')}
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-300 truncate">
                      sub.to.race@gmail.com
                    </p>
                  </div>
                </a>
              </div>
            </section>

        
          </div>
        </div>
      </div>
    </div>
  );
}


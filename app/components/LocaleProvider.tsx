'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { defaultLocale, type Locale } from '../../i18n';

interface LocaleProviderProps {
  children: React.ReactNode;
  initialMessages: any;
  initialLocale: Locale;
}

export default function LocaleProvider({ 
  children, 
  initialMessages, 
  initialLocale 
}: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    // Récupère la locale depuis localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && savedLocale !== locale) {
      // Charge les messages pour la nouvelle locale
      import(`../../messages/${savedLocale}.json`)
        .then((module) => {
          setMessages(module.default);
          setLocale(savedLocale);
          // Met à jour l'attribut lang du html
          document.documentElement.lang = savedLocale;
        })
        .catch(() => {
          // Si le fichier n'existe pas, garde la locale actuelle
          console.error(`Failed to load locale: ${savedLocale}`);
        });
    }
  }, []);

  // Écoute les changements de locale depuis localStorage et les événements
  useEffect(() => {
    const handleLocaleChange = () => {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && savedLocale !== locale) {
        import(`../../messages/${savedLocale}.json`)
          .then((module) => {
            setMessages(module.default);
            setLocale(savedLocale);
            document.documentElement.lang = savedLocale;
          })
          .catch(() => {
            console.error(`Failed to load locale: ${savedLocale}`);
          });
      }
    };

    // Écoute les changements de storage (autres onglets)
    window.addEventListener('storage', handleLocaleChange);
    // Écoute l'événement personnalisé (même onglet)
    window.addEventListener('localechange', handleLocaleChange);

    return () => {
      window.removeEventListener('storage', handleLocaleChange);
      window.removeEventListener('localechange', handleLocaleChange);
    };
  }, [locale]);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}


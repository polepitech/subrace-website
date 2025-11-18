import { getRequestConfig } from 'next-intl/server';

// Langues supportées
export const locales = ['fr', 'en', 'es', 'pt'] as const;
export type Locale = (typeof locales)[number];

// Langue par défaut
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => {
  // Utilise la locale par défaut si la locale n'est pas valide
  // Le middleware devrait déjà avoir validé la locale avant d'arriver ici
  const validLocale = (locale && locales.includes(locale as Locale)) 
    ? (locale as Locale) 
    : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});


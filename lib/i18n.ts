import { getTranslations } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from '../i18n';

export { locales, defaultLocale, type Locale };

// Helper pour obtenir les traductions côté serveur
export async function getServerTranslations(locale: Locale = defaultLocale) {
  return await getTranslations({ locale });
}

// Helper pour obtenir les traductions côté client (dans les composants client)
export function useClientTranslations() {
  // Cette fonction sera utilisée avec useTranslations de next-intl dans les composants client
  return null; // Placeholder - sera utilisé avec useTranslations directement
}


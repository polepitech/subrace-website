import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale } from './i18n';

export function middleware(request: NextRequest) {
  // Ajoute simplement la locale dans les headers pour next-intl
  // sans modifier les routes
  const response = NextResponse.next();
  response.headers.set('x-next-intl-locale', defaultLocale);
  return response;
}

export const config = {
  // Matcher pour les routes à traiter (exclut les fichiers statiques, API, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};


/**
 * Utilitaires de sécurité pour les routes API
 */

/**
 * Vérifie si la requête provient de localhost
 */
export function isLocalhost(request: Request): boolean {
  const url = new URL(request.url);
  const host = request.headers.get('host') || url.hostname;
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  // Vérifier l'hostname
  const isLocalhostHost = 
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('localhost:') ||
    host.startsWith('127.0.0.1:') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1';
  
  // Vérifier les headers de proxy (si présents)
  const isLocalhostIp = 
    forwardedFor === '127.0.0.1' ||
    forwardedFor === '::1' ||
    realIp === '127.0.0.1' ||
    realIp === '::1';
  
  return isLocalhostHost || isLocalhostIp;
}

/**
 * Vérifie si l'origine de la requête est localhost
 */
export function isLocalhostOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    // Si pas d'origine (requête same-origin), considérer comme localhost
    return isLocalhost(request);
  }
  
  try {
    const originUrl = new URL(origin);
    return (
      originUrl.hostname === 'localhost' ||
      originUrl.hostname === '127.0.0.1' ||
      originUrl.hostname === '::1'
    );
  } catch {
    return false;
  }
}

/**
 * Retourne les headers CORS pour localhost uniquement
 */
export function getLocalhostCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': 'http://localhost:3333',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/**
 * Valide qu'une requête provient de localhost et retourne une erreur si ce n'est pas le cas
 */
export function validateLocalhost(request: Request): Response | null {
  if (!isLocalhost(request) && !isLocalhostOrigin(request)) {
    return new Response(JSON.stringify({ 
      error: 'Forbidden: Access restricted to localhost only' 
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  }
  return null;
}


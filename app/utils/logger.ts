import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'instagram-avatar-requests.log');

/**
 * S'assure que le dossier logs existe
 */
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Extrait l'IP réelle de la requête (gère les proxies)
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs, prendre la première
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback: essayer d'extraire depuis l'URL
  try {
    const url = new URL(request.url);
    return url.hostname || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Log une requête vers le fichier de log
 */
export async function logInstagramAvatarRequest(data: {
  ip: string;
  userAgent: string | null;
  username: string;
  timestamp: string;
  success: boolean;
  exitCode?: number;
  duration?: number;
  error?: string;
}) {
  try {
    ensureLogDir();
    
    const logEntry = {
      timestamp: data.timestamp,
      ip: data.ip,
      userAgent: data.userAgent || 'unknown',
      username: data.username,
      success: data.success,
      exitCode: data.exitCode ?? null,
      duration: data.duration ?? null,
      error: data.error || null,
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Écrire de manière asynchrone pour ne pas bloquer
    await fs.promises.appendFile(LOG_FILE, logLine, 'utf8');
  } catch (error) {
    // Ne pas faire échouer la requête si le logging échoue
    console.error(`[LOGGER] Erreur lors de l'écriture du log:`, error);
  }
}


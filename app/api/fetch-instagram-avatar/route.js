import { spawn } from 'child_process';
import 'dotenv/config';
import { validateLocalhost, getLocalhostCorsHeaders } from '../../utils/security';
import { logInstagramAvatarRequest, getClientIp } from '../../utils/logger';

// Cache en mémoire pour tracker les requêtes en cours par username
// Structure: Map<username, { timestamp: number, promise: Promise }>
const requestCache = new Map();

// Nettoyer le cache toutes les 30 secondes pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  const thirtySeconds = 30 * 1000;
  
  for (const [username, cacheEntry] of requestCache.entries()) {
    if (now - cacheEntry.timestamp > thirtySeconds) {
      requestCache.delete(username);
    }
  }
}, 30 * 1000);

export async function GET(request) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent');
  let username = null;
  let exitCode = null;
  let duration = null;
  let success = false;
  let errorMessage = null;

  try {
    // Vérifier que la requête provient de localhost
    const localhostError = validateLocalhost(request);
    if (localhostError) {
      errorMessage = 'Forbidden: Access restricted to localhost only';
      duration = Date.now() - startTime;
      
      await logInstagramAvatarRequest({
        ip,
        userAgent,
        username: 'unknown',
        timestamp,
        success: false,
        duration,
        error: errorMessage,
      });
      
      return localhostError;
    }

    const { searchParams } = new URL(request.url);
    username = searchParams.get('username');
    
    if (!username) {
      errorMessage = 'Paramètre username manquant.';
      duration = Date.now() - startTime;
      
      await logInstagramAvatarRequest({
        ip,
        userAgent,
        username: 'unknown',
        timestamp,
        success: false,
        duration,
        error: errorMessage,
      });
      
      return new Response(JSON.stringify({ 
        error: errorMessage
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...getLocalhostCorsHeaders(),
        },
      });
    }

    // Validation stricte du username - seulement caractères alphanumériques, points, tirets, underscores
    // Longueur entre 1 et 50 caractères
    const usernameRegex = /^[a-zA-Z0-9._-]{1,50}$/;
    if (!usernameRegex.test(username)) {
      errorMessage = 'Format de username invalide.';
      duration = Date.now() - startTime;
      
      await logInstagramAvatarRequest({
        ip,
        userAgent,
        username,
        timestamp,
        success: false,
        duration,
        error: errorMessage,
      });
      
      return new Response(JSON.stringify({ 
        error: errorMessage
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...getLocalhostCorsHeaders(),
        },
      });
    }

    // Vérifier le cache pour éviter les appels simultanés pour le même username
    const cachedRequest = requestCache.get(username);
    if (cachedRequest) {
      const timeSinceCache = Date.now() - cachedRequest.timestamp;
      const thirtySeconds = 30 * 1000;
      
      if (timeSinceCache < thirtySeconds) {
        // Une requête est déjà en cours ou récente, attendre sa résolution ou retourner une erreur
        errorMessage = 'Une requête pour ce username est déjà en cours. Veuillez patienter.';
        duration = Date.now() - startTime;
        
        await logInstagramAvatarRequest({
          ip,
          userAgent,
          username,
          timestamp,
          success: false,
          duration,
          error: errorMessage,
        });
        
        return new Response(JSON.stringify({ 
          error: errorMessage,
          retryAfter: Math.ceil((thirtySeconds - timeSinceCache) / 1000),
        }), {
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((thirtySeconds - timeSinceCache) / 1000).toString(),
            ...getLocalhostCorsHeaders(),
          },
        });
      } else {
        // Le cache est expiré, le supprimer
        requestCache.delete(username);
      }
    }

    const otherProjectPath = process.env.SUBRACE_PROJECT_PATH || '/Users/pollux/Desktop/DEV/projets/SubRace';
    const npmScriptName = process.env.INSTAGRAM_AVATAR_NPM_SCRIPT || 'fetch:instagram-avatar';
    
    // Validation supplémentaire des noms de scripts pour éviter l'injection
    // Les scripts npm peuvent contenir des deux-points (:) comme dans "fetch:instagram-avatar"
    if (!/^[a-zA-Z0-9._:-]+$/.test(npmScriptName)) {
      errorMessage = `Nom de script npm invalide: ${npmScriptName}`;
      duration = Date.now() - startTime;
      console.error(`[${new Date().toISOString()}] ${errorMessage}`);
      
      await logInstagramAvatarRequest({
        ip,
        userAgent,
        username,
        timestamp,
        success: false,
        duration,
        error: errorMessage,
      });
      
      return new Response(JSON.stringify({ 
        error: 'Configuration invalide.' 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...getLocalhostCorsHeaders(),
        },
      });
    }
    
    console.log(`[${new Date().toISOString()}] Démarrage de l'exécution du script npm dans: ${otherProjectPath}`);
    console.log(`[${new Date().toISOString()}] Script npm: ${npmScriptName}`);
    console.log(`[${new Date().toISOString()}] Username: ${username}`);

    // Ajouter la requête au cache
    const cacheEntry = {
      timestamp: Date.now(),
      promise: null,
    };
    requestCache.set(username, cacheEntry);

    const logs = [];
    let stdoutData = '';
    let stderrData = '';

    // Utiliser spawn SANS shell pour éviter l'injection de commande
    // Les arguments sont passés directement dans un tableau, ce qui empêche l'interprétation shell
    const requestPromise = new Promise((resolve, reject) => {
      // Exécuter npm run avec spawn sans shell
      // Les arguments sont passés séparément, ce qui empêche l'injection
      const npmProcess = spawn('npm', ['run', npmScriptName, '--', username], {
        cwd: otherProjectPath,
        shell: false, // DÉSACTIVÉ pour sécurité - pas d'interprétation shell
        env: {
          ...process.env,
          USERNAME: username, // Passé via variable d'environnement aussi
        },
      });

      // Capturer stdout en temps réel
      npmProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdoutData += output;
        const lines = output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.log(`[SCRIPT STDOUT] ${line}`);
          logs.push({ type: 'stdout', message: line, timestamp: new Date().toISOString() });
        });
      });

      // Capturer stderr en temps réel
      npmProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderrData += output;
        const lines = output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.error(`[SCRIPT STDERR] ${line}`);
          logs.push({ type: 'stderr', message: line, timestamp: new Date().toISOString() });
        });
      });

      // Quand le processus se termine
      npmProcess.on('close', (code) => {
        exitCode = code;
        duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Script terminé avec le code: ${code}`);
        
        // Nettoyer le cache après la fin de l'exécution
        requestCache.delete(username);
        
        if (code === 0) {
          success = true;
          resolve(new Response(JSON.stringify({
            success: true,
            username: username,
            logs: logs,
            stdout: stdoutData,
            stderr: stderrData,
            exitCode: code,
            timestamp: new Date().toISOString(),
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...getLocalhostCorsHeaders(),
            },
          }));
        } else {
          errorMessage = `Script terminé avec le code d'erreur: ${code}`;
          reject(new Error(errorMessage));
        }
      });

      // Gérer les erreurs du processus
      npmProcess.on('error', (error) => {
        duration = Date.now() - startTime;
        errorMessage = `Erreur lors du lancement du script: ${error.message}`;
        console.error(`[${new Date().toISOString()}] Erreur lors du lancement du script:`, error);
        
        // Nettoyer le cache en cas d'erreur
        requestCache.delete(username);
        
        reject(error);
      });
    });

    // Stocker la promesse dans le cache
    cacheEntry.promise = requestPromise;

    // Attendre la résolution et logger
    try {
      const response = await requestPromise;
      
      // Logger le succès
      await logInstagramAvatarRequest({
        ip,
        userAgent,
        username,
        timestamp,
        success: true,
        exitCode,
        duration,
      });
      
      return response;
    } catch (error) {
      // Logger l'erreur
      await logInstagramAvatarRequest({
        ip,
        userAgent,
        username,
        timestamp,
        success: false,
        exitCode,
        duration,
        error: errorMessage || error.message,
      });
      
      throw error;
    }

  } catch (error) {
    duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Erreur:`, error);
    
    // Nettoyer le cache en cas d'erreur non gérée
    if (username) {
      requestCache.delete(username);
    }
    
    // Ne pas exposer les détails de l'erreur en production
    const errorMessageToReturn = process.env.NODE_ENV === 'production' 
      ? 'Une erreur est survenue lors de l\'exécution du script.'
      : (errorMessage || error.message);
    
    // Logger l'erreur
    await logInstagramAvatarRequest({
      ip,
      userAgent,
      username: username || 'unknown',
      timestamp,
      success: false,
      exitCode,
      duration,
      error: errorMessageToReturn,
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessageToReturn,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  }
}
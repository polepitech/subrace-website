import { spawn } from 'child_process';
import 'dotenv/config';
import { validateLocalhost, getLocalhostCorsHeaders } from '../../utils/security';

export async function GET(request) {
  try {
    // Vérifier que la requête provient de localhost
    const localhostError = validateLocalhost(request);
    if (localhostError) {
      return localhostError;
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return new Response(JSON.stringify({ 
        error: 'Paramètre username manquant.' 
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
      return new Response(JSON.stringify({ 
        error: 'Format de username invalide.' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...getLocalhostCorsHeaders(),
        },
      });
    }

    const otherProjectPath = process.env.SUBRACE_PROJECT_PATH || '/Users/pollux/Desktop/DEV/projets/SubRace';
    const npmScriptName = process.env.INSTAGRAM_AVATAR_NPM_SCRIPT || 'fetch:instagram-avatar';
    
    // Validation supplémentaire des noms de scripts pour éviter l'injection
    // Les scripts npm peuvent contenir des deux-points (:) comme dans "fetch:instagram-avatar"
    if (!/^[a-zA-Z0-9._:-]+$/.test(npmScriptName)) {
      console.error(`[${new Date().toISOString()}] Nom de script npm invalide: ${npmScriptName}`);
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

    const logs = [];
    let stdoutData = '';
    let stderrData = '';

    // Utiliser spawn SANS shell pour éviter l'injection de commande
    // Les arguments sont passés directement dans un tableau, ce qui empêche l'interprétation shell
    return new Promise((resolve, reject) => {
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
        console.log(`[${new Date().toISOString()}] Script terminé avec le code: ${code}`);
        
        if (code === 0) {
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
          reject(new Error(`Script terminé avec le code d'erreur: ${code}`));
        }
      });

      // Gérer les erreurs du processus
      npmProcess.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Erreur lors du lancement du script:`, error);
        reject(error);
      });
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erreur:`, error);
    // Ne pas exposer les détails de l'erreur en production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Une erreur est survenue lors de l\'exécution du script.'
      : error.message;
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
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
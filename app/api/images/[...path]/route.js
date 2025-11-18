import fs from 'fs';
import path from 'path';
import 'dotenv/config';

export async function GET(request, { params }) {
  try {
    // Récupérer le chemin depuis la variable d'environnement
    const imagesBasePath = process.env.IMAGES_PATH;
    
    if (!imagesBasePath) {
      return new Response('IMAGES_PATH environment variable is not set', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Dans Next.js 16, params peut être une Promise ou un objet direct
    let resolvedParams = params;
    if (params && typeof params.then === 'function') {
      resolvedParams = await params;
    } else if (params && typeof params === 'object') {
      resolvedParams = await Promise.resolve(params);
    }
    
    // Extraire le chemin depuis params ou depuis l'URL
    let pathSegments = [];
    
    if (resolvedParams && resolvedParams.path) {
      // Avec [...path], path est toujours un tableau
      pathSegments = Array.isArray(resolvedParams.path) 
        ? resolvedParams.path
        : typeof resolvedParams.path === 'string'
        ? resolvedParams.path.split('/').filter(Boolean)
        : [];
    } else {
      // Fallback: extraire depuis l'URL de la requête
      const url = new URL(request.url);
      const urlPath = url.pathname;
      // Enlever '/api/images' du début
      const relativePath = urlPath.replace(/^\/api\/images\/?/, '');
      pathSegments = relativePath.split('/').filter(Boolean);
    }
    
    if (pathSegments.length === 0) {
      console.error('No path segments found. Params:', resolvedParams, 'URL:', request.url);
      return new Response('No path provided', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    // Validation de sécurité : vérifier chaque segment pour prévenir path traversal
    const isValidSegment = (segment) => {
      if (!segment || typeof segment !== 'string') return false;
      // Rejeter les segments contenant '..' (path traversal)
      if (segment.includes('..')) return false;
      // Rejeter les chemins absolus
      if (path.isAbsolute(segment)) return false;
      // Autoriser seulement caractères alphanumériques, points, tirets, underscores et slashes
      // Mais pas de slashes dans les segments individuels (déjà séparés)
      if (segment.includes('/') || segment.includes('\\')) return false;
      // Autoriser seulement caractères sûrs
      return /^[a-zA-Z0-9._-]+$/.test(segment);
    };
    
    // Valider tous les segments
    if (!pathSegments.every(isValidSegment)) {
      return new Response('Invalid path: path traversal detected', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    const filePath = path.join(imagesBasePath, ...pathSegments);

    // Sécurité : vérifier que le chemin est bien dans le dossier autorisé
    const resolvedBasePath = path.resolve(imagesBasePath);
    const resolvedFilePath = path.resolve(filePath);
    
    if (!resolvedFilePath.startsWith(resolvedBasePath)) {
      return new Response('Access denied', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Vérifier si le fichier existe
    if (!fs.existsSync(resolvedFilePath)) {
      return new Response('File not found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Lire le fichier
    const fileBuffer = fs.readFileSync(resolvedFilePath);
    
    // Déterminer le type MIME basé sur l'extension
    const ext = path.extname(resolvedFilePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Retourner le fichier avec les bons headers
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}


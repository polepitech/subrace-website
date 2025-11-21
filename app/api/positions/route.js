import mysql from 'mysql2/promise';
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
    
    // Validation stricte des paramètres de pagination
    const rawPage = searchParams.get('page') || '0';
    const rawLimit = searchParams.get('limit') || '100';
    
    // Validation stricte: s'assurer que les valeurs sont bien des entiers
    const parsedPage = parseInt(rawPage, 10);
    const parsedLimit = parseInt(rawLimit, 10);
    
    // Vérifier que ce sont bien des entiers valides
    if (isNaN(parsedPage) || isNaN(parsedLimit) || 
        rawPage !== parsedPage.toString() || rawLimit !== parsedLimit.toString()) {
      return new Response(JSON.stringify({ 
        error: 'Invalid pagination parameters' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getLocalhostCorsHeaders(),
        },
      });
    }
    
    // Valider et forcer les valeurs à être des entiers positifs dans des plages sûres
    const page = Math.max(0, Math.min(1000, parsedPage)); // Max 1000 pages
    const limit = Math.max(1, Math.min(500, parsedLimit)); // Limite max à 500
    const offset = page * limit;
    
    // Validation finale: s'assurer que offset est un entier sûr
    if (!Number.isInteger(offset) || offset < 0 || offset > 500000) {
      return new Response(JSON.stringify({ 
        error: 'Invalid pagination parameters' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...getLocalhostCorsHeaders(),
        },
      });
    }

    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'SubRace'
    });

    // Calcule le total de positions
    const [countRows] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM follower_positions fp
    `);
    const total = countRows[0]?.total || 0;

    // Récupère les positions avec jointure sur followers pour avoir les usernames (paginé)
    // MySQL ne supporte pas les paramètres préparés pour LIMIT/OFFSET, donc interpolation directe sécurisée
    // Les valeurs limit et offset sont garanties être des entiers validés (pas d'injection SQL possible)
    const [rows] = await connection.execute(`
      SELECT 
        fp.race_id,
        fp.followers_id,
        fp.position,
        f.username
      FROM follower_positions fp
      INNER JOIN followers f ON fp.followers_id = f.id
      ORDER BY fp.race_id, fp.position
      LIMIT ${limit} OFFSET ${offset}
    `);

    await connection.end();

    const hasMore = offset + limit < total;

    return new Response(JSON.stringify({
      positions: rows,
      total,
      page,
      limit,
      hasMore
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Database error'
      : error.message;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  }
}


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
    const rawLimit = searchParams.get('limit') || '25';
    
    // Validation stricte: s'assurer que les valeurs sont bien des entiers
    // Utiliser Number.isInteger pour vérifier après parseInt
    const parsedPage = parseInt(rawPage, 10);
    const parsedLimit = parseInt(rawLimit, 10);
    
    // Vérifier que ce sont bien des entiers valides (pas NaN, pas de décimales)
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
    const page = Math.max(0, Math.min(10000, parsedPage)); // Max 10000 pages
    const limit = Math.max(1, Math.min(100, parsedLimit)); // Limite max à 100
    const offset = page * limit;
    
    // Validation finale: s'assurer que offset est un entier sûr
    if (!Number.isInteger(offset) || offset < 0 || offset > 1000000) {
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

    // Calcule le total d'utilisateurs avec des points
    const [countRows] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM followers f
      WHERE f.score > 0
    `);
    const total = countRows[0]?.total || 0;

    // Récupère les utilisateurs avec leurs scores, paginés
    // LIMIT et OFFSET sont validés comme entiers sûrs avant utilisation
    // MySQL ne supporte pas les paramètres préparés pour LIMIT/OFFSET, donc interpolation directe sécurisée
    // Les valeurs limit et offset sont garanties être des entiers validés (pas d'injection SQL possible)
    const [rows] = await connection.execute(`
      SELECT 
        f.id,
        f.username,
        f.score
      FROM followers f
      WHERE f.score > 0
      ORDER BY f.score DESC, f.username ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    await connection.end();

    const hasMore = offset + limit < total;

    const users = rows.map(row => ({
      username: row.username,
      img: `/api/images/avatars/${row.username}.jpg`,
      point: parseInt(row.score) || 0
    }));

    return new Response(JSON.stringify({
      users,
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
    console.error('Error fetching leaderboard:', error);
    // Ne pas exposer les détails de l'erreur en production
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


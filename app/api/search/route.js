import pool from '../../lib/db';
import { validateLocalhost, getLocalhostCorsHeaders } from '../../utils/security';

export async function GET(request) {
  let connection;
  try {
    // Vérifier que la requête provient de localhost
    const localhostError = validateLocalhost(request);
    if (localhostError) {
      return localhostError;
    }

    const { searchParams } = new URL(request.url);
    
    // Si aucun paramètre de pagination n'est fourni, retourner tous les utilisateurs (pour la recherche)
    const hasPagination = searchParams.has('page') || searchParams.has('limit');
    
    let page = 0;
    let limit = 1000000; // Limite très élevée pour retourner tous les utilisateurs
    let offset = 0;
    
    if (hasPagination) {
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
      page = Math.max(0, Math.min(1000, parsedPage)); // Max 1000 pages
      limit = Math.max(1, Math.min(500, parsedLimit)); // Limite max à 500
      offset = page * limit;
      
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
    }

    connection = await pool.getConnection();

    // Calcule le total d'utilisateurs avec des points
    const [countRows] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM followers f
      WHERE f.score > 0
    `);
    const total = countRows[0]?.total || 0;

    // Récupère les utilisateurs avec leurs scores (avec pagination)
    const [rows] = await connection.execute(`
      SELECT 
        f.id,
        f.username,
        f.score as total_points
      FROM followers f
      ORDER BY f.score DESC, f.username ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    connection.release();

    const users = rows.map(row => ({
      username: row.username,
      img: `/api/images/avatars/${row.username}.jpg`,
      point: parseInt(row.total_points) || 0
    }));

    // Si pas de pagination, retourner directement le tableau pour compatibilité
    if (!hasPagination) {
      return new Response(JSON.stringify(users), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getLocalhostCorsHeaders(),
        },
      });
    }

    const hasMore = offset + limit < total;

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
    console.error('Error fetching search data:', error);
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
  } finally {
    if (connection) {
      connection.release();
    }
  }
}


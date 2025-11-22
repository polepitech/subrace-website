import pool from '../../../lib/db';
import { validateLocalhost, getLocalhostCorsHeaders } from '../../../utils/security';

export async function GET(request, { params }) {
  let connection;
  try {
    // Vérifier que la requête provient de localhost
    const localhostError = validateLocalhost(request);
    if (localhostError) {
      return localhostError;
    }
    // Dans Next.js 16, params peut être une Promise
    let resolvedParams = params;
    if (params && typeof params.then === 'function') {
      resolvedParams = await params;
    }
    const rawRaceId = resolvedParams.id;

    // Validation stricte de raceId
    const raceId = parseInt(rawRaceId, 10);
    if (!raceId || raceId <= 0 || isNaN(raceId)) {
      return new Response(JSON.stringify({ error: 'Invalid race ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Récupère les paramètres de pagination
    const { searchParams } = new URL(request.url);
    
    // Validation stricte des paramètres de pagination
    const rawOffset = searchParams.get('offset') || '0';
    const rawLimit = searchParams.get('limit') || '25';
    
    // Valider et forcer les valeurs à être des entiers positifs
    const offset = Math.max(0, parseInt(rawOffset, 10) || 0);
    const limit = Math.max(1, Math.min(100, parseInt(rawLimit, 10) || 25)); // Limite max à 100
    
    const startPosition = offset + 1;
    const endPosition = offset + limit;

    const connection = await pool.getConnection();

    // Récupère les informations de la course
    const [raceRows] = await connection.execute(
      'SELECT * FROM races WHERE id = ?',
      [raceId]
    );

    if (raceRows.length === 0) {
      connection.release();
      return new Response(JSON.stringify({ error: 'Race not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calcule le total de positions pour cette course
    const [countRows] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM follower_positions
      WHERE race_id = ?
    `, [raceId]);
    const total = countRows[0]?.total || 0;

    // Récupère les positions pour cette course avec les usernames (paginé)
    const [positionRows] = await connection.execute(`
      SELECT 
        fp.position,
        fp.followers_id,
        f.username
      FROM follower_positions fp
      INNER JOIN followers f ON fp.followers_id = f.id
      WHERE fp.race_id = ? AND fp.position BETWEEN ? AND ?
      ORDER BY fp.position
    `, [raceId, startPosition, endPosition]);

    connection.release();

    const race = raceRows[0];
    const hasMore = offset + limit < total;

    const result = {
      ...race,
      positions: positionRows,
      total,
      offset,
      limit,
      hasMore
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error fetching race:', error);
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


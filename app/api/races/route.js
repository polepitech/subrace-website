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
    connection = await pool.getConnection();

    const [rows] = await connection.execute('SELECT * FROM races ORDER BY created_at DESC');

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error fetching races:', error);
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


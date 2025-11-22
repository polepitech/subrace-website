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

 
    var [rows] = await connection.execute('SELECT * FROM followers WHERE image_url = "true" ORDER BY RAND()');
    

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getLocalhostCorsHeaders(),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
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

import mysql from 'mysql2/promise';
import 'dotenv/config';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validation stricte des paramètres de pagination
    const rawPage = searchParams.get('page') || '0';
    const rawLimit = searchParams.get('limit') || '25';
    
    // Valider et forcer les valeurs à être des entiers positifs
    const page = Math.max(0, parseInt(rawPage, 10) || 0);
    const limit = Math.max(1, Math.min(100, parseInt(rawLimit, 10) || 25)); // Limite max à 100
    const offset = page * limit;

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
    // Note: LIMIT et OFFSET doivent être des nombres, pas des paramètres préparés
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
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


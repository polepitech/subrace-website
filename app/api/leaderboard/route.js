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
      SELECT COUNT(DISTINCT f.id) as total
      FROM followers f
      INNER JOIN follower_positions fp ON f.id = fp.followers_id
    `);
    const total = countRows[0]?.total || 0;

    // Récupère les utilisateurs avec leurs points totaux, paginés
    // Note: LIMIT et OFFSET doivent être des nombres, pas des paramètres préparés
    const [rows] = await connection.execute(`
      SELECT 
        f.id,
        f.username,
        SUM(CASE 
          WHEN fp.position <= 10 THEN 
            GREATEST(0, 40000 - fp.position) + 
            CASE fp.position
              WHEN 1 THEN 10000 
              WHEN 2 THEN 7000 
              WHEN 3 THEN 5000
              WHEN 4 THEN 4000 
              WHEN 5 THEN 3000 
              WHEN 6 THEN 2000
              WHEN 7 THEN 1500 
              WHEN 8 THEN 1000 
              WHEN 9 THEN 500
              WHEN 10 THEN 250 
              ELSE 0 
            END
          ELSE GREATEST(0, 40000 - fp.position)
        END) as total_points
      FROM followers f
      INNER JOIN follower_positions fp ON f.id = fp.followers_id
      GROUP BY f.id, f.username
      ORDER BY total_points DESC, f.username ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    await connection.end();

    const hasMore = offset + limit < total;

    const users = rows.map(row => ({
      username: row.username,
      img: `/api/images/avatars/${row.username.toLowerCase()}.jpg`,
      point: parseInt(row.total_points) || 0
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


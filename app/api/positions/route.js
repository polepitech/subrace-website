import mysql from 'mysql2/promise';
import 'dotenv/config';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'SubRace'
    });

    // Récupère toutes les positions avec jointure sur followers pour avoir les usernames
    const [rows] = await connection.execute(`
      SELECT 
        fp.race_id,
        fp.followers_id,
        fp.position,
        f.username
      FROM follower_positions fp
      INNER JOIN followers f ON fp.followers_id = f.id
      ORDER BY fp.race_id, fp.position
    `);

    await connection.end();

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      },
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


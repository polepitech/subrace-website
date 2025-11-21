import mysql from 'mysql2/promise';
import 'dotenv/config';

export async function GET(request, { params }) {
  try {
    // Dans Next.js 16, params peut être une Promise
    let resolvedParams = params;
    if (params && typeof params.then === 'function') {
      resolvedParams = await params;
    }
    const rawUsername = resolvedParams.username;

    // Validation stricte du username
    if (!rawUsername || typeof rawUsername !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid username' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Valider que le username ne contient que des caractères autorisés et respecte la longueur
    // Autoriser : lettres, chiffres, tirets, underscores, points
    // Longueur : entre 1 et 50 caractères
    const usernameRegex = /^[a-zA-Z0-9._-]{1,50}$/;
    if (!usernameRegex.test(rawUsername)) {
      return new Response(JSON.stringify({ error: 'Invalid username format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const username = rawUsername;

    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'SubRace'
    });

    // Récupère les informations du follower
    const [followerRows] = await connection.execute(
      'SELECT * FROM followers WHERE username = ?',
      [username]
    );

    if (followerRows.length === 0) {
      await connection.end();
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const follower = followerRows[0];

    // Récupère toutes les positions de ce follower avec les infos des courses
    const [positions] = await connection.execute(`
      SELECT 
        fp.race_id,
        fp.position,
        r.day as race_name
      FROM follower_positions fp
      INNER JOIN races r ON fp.race_id = r.id
      WHERE fp.followers_id = ?
      ORDER BY fp.race_id DESC
    `, [follower.id]);

    // Calcule les statistiques
    const totalRaces = positions.length;
    const totalPoints = positions.reduce((sum, pos) => {
      // Points de base : 40000 - position
      const basePoints = Math.max(0, 40000 - pos.position);
      // Bonus podium
      const podiumBonuses = {
        1: 10000, 2: 7000, 3: 5000, 4: 4000, 5: 3000,
        6: 2000, 7: 1500, 8: 1000, 9: 500, 10: 250
      };
      const bonus = podiumBonuses[pos.position] || 0;
      return sum + basePoints + bonus;
    }, 0);

    const podiums = positions.filter(p => p.position <= 3).length;
    const victories = positions.filter(p => p.position === 1).length;
    const bestPosition = positions.length > 0 ? Math.min(...positions.map(p => p.position)) : null;
    const averagePosition = positions.length > 0 
      ? positions.reduce((sum, p) => sum + p.position, 0) / positions.length 
      : null;

    // Calcule le rang global
    // Récupère toutes les positions de tous les followers
    const [allPositions] = await connection.execute(`
      SELECT 
        fp.followers_id,
        fp.position,
        f.username
      FROM follower_positions fp
      INNER JOIN followers f ON fp.followers_id = f.id
    `);

    // Calcule les points pour chaque follower
    const followersPoints = {};
    allPositions.forEach((pos) => {
      if (!followersPoints[pos.username]) {
        followersPoints[pos.username] = 0;
      }
      // Points de base : 40000 - position
      const basePoints = Math.max(0, 40000 - pos.position);
      // Bonus podium
      const podiumBonuses = {
        1: 10000, 2: 7000, 3: 5000, 4: 4000, 5: 3000,
        6: 2000, 7: 1500, 8: 1000, 9: 500, 10: 250
      };
      const bonus = podiumBonuses[pos.position] || 0;
      followersPoints[pos.username] += basePoints + bonus;
    });

    // Trie par points décroissants, puis par username
    const sortedUsers = Object.entries(followersPoints).sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' });
    });

    // Trouve le rang de l'utilisateur actuel
    const globalRank = sortedUsers.findIndex(([username]) => username === follower.username) + 1;

    await connection.end();

    const result = {
      follower: {
        id: follower.id,
        username: follower.username,
        img: `/api/images/avatars/${follower.username}.jpg`
      },
      stats: {
        totalRaces,
        totalPoints,
        podiums,
        victories,
        bestPosition,
        averagePosition: averagePosition ? Math.round(averagePosition * 10) / 10 : null,
        globalRank: globalRank > 0 ? globalRank : null
      },
      races: positions
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

